import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminUser, AdminUsersService } from '../../services/admin-users.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-select-profile',
  standalone: true,
  styles: [`
    :host {
      --bg:     #f4ede0;
      --card:   #ede3d0;
      --fg:     #1e1710;
      --accent: #8c3a2a;
      --muted:  #6b5c45;
      --border: rgba(30,23,16,0.18);
      display: block;
    }
    button { border-radius: 0; cursor: pointer; }
    .tile:hover .avatar { border-color: var(--fg); }
    input[type=text] {
      width: 100%;
      border: 1px solid var(--border);
      padding: 12px 16px;
      font-family: 'Lora', serif;
      font-size: 1rem;
      background: var(--bg);
      color: var(--fg);
      outline: none;
      border-radius: 0;
      transition: border-color 0.15s;
    }
    input[type=text]:focus { border-color: var(--fg); }
  `],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center px-5 py-12" style="background:var(--bg)">
      <p class="text-xs uppercase tracking-widest mb-2"
        style="font-family:'DM Mono',monospace;color:var(--muted)">FaceFile</p>
      <h1 class="mb-10 text-center" style="font-family:'Playfair Display',serif;font-size:clamp(1.5rem,5vw,2rem);color:var(--fg)">
        {{ hasProfiles() ? "Who's using FaceFile?" : 'Create your profile' }}
      </h1>

      @if (error()) {
        <p class="mb-6 text-sm" style="font-family:'DM Mono',monospace;color:var(--accent)">{{ error() }}</p>
      }

      @if (hasProfiles()) {
        <div class="flex flex-wrap justify-center gap-6 mb-10 max-w-2xl">
          @for (u of users(); track u.id) {
            <button type="button" class="tile flex flex-col items-center gap-3 bg-transparent border-0" [attr.aria-label]="u.name"
              (click)="selectProfile(u)" [disabled]="selecting()">
              <span class="avatar flex items-center justify-center border-2"
                style="width:88px;height:88px;border-radius:50%;background:var(--card);border-color:var(--border);transition:border-color 0.15s">
                <span style="font-family:'Playfair Display',serif;font-size:28px;color:var(--fg)">{{ initials(u.name) }}</span>
              </span>
              <span style="font-family:'Lora',serif;font-size:14px;color:var(--fg)">{{ u.name }}</span>
            </button>
          }
        </div>
      }

      <!-- Nobody to pick means nobody can get in, so the prompt opens itself
           when the list is empty; with profiles listed it stays behind the
           "Create a profile" action rather than competing with the tiles. -->
      @if (showCreateForm()) {
        <div class="border px-5 py-5 mb-8 w-full max-w-sm" style="background:var(--card);border-color:var(--border)">
          @if (!hasProfiles()) {
            <p class="mb-4 text-center" style="font-family:'Lora',serif;font-size:14px;color:var(--muted)">
              No profiles yet. Add a name to get started.
            </p>
          }

          <p class="text-xs uppercase tracking-widest mb-2"
            style="font-family:'DM Mono',monospace;color:var(--muted)">Name</p>
          <input type="text" [value]="nameField()"
            (input)="nameField.set($any($event.target).value)"
            (keyup.enter)="createProfile()"
            aria-label="Name"
            placeholder="e.g. Priya" />

          @if (formError()) {
            <p class="mt-3" style="font-family:'DM Mono',monospace;font-size:12px;color:var(--accent)">
              {{ formError() }}
            </p>
          }

          <div class="flex gap-3 pt-4">
            <button type="button" (click)="createProfile()" [disabled]="saving()"
              class="border px-4 py-2 text-xs uppercase tracking-widest"
              style="font-family:'DM Mono',monospace;color:var(--bg);background:var(--fg);border-color:var(--fg)">
              {{ saving() ? 'Creating…' : 'Create profile' }}
            </button>
            @if (hasProfiles()) {
              <button type="button" (click)="closeCreateForm()"
                class="border px-4 py-2 text-xs uppercase tracking-widest"
                style="font-family:'DM Mono',monospace;color:var(--fg);background:transparent;border-color:var(--border)">
                Cancel
              </button>
            }
          </div>
        </div>
      } @else if (hasProfiles()) {
        <button type="button" (click)="openCreateForm()"
          class="border px-4 py-2 mb-8 text-xs uppercase tracking-widest"
          style="font-family:'DM Mono',monospace;color:var(--fg);background:transparent;border-color:var(--fg)">
          + Create a profile
        </button>
      }

      <label class="flex items-center gap-2 text-sm" style="font-family:'Lora',serif;color:var(--muted)">
        <input type="checkbox" [checked]="rememberMe()" (change)="rememberMe.set($any($event.target).checked)" />
        Remember me on this device
      </label>
    </div>
  `,
})
export class SelectProfileComponent implements OnInit {
  private adminUsersService = inject(AdminUsersService);
  private sessionService = inject(SessionService);
  private router = inject(Router);

  readonly users      = signal<AdminUser[]>([]);
  readonly loaded     = signal(false);
  readonly rememberMe = signal(false);
  readonly selecting  = signal(false);
  readonly error      = signal<string | null>(null);

  readonly creating   = signal(false);
  readonly nameField  = signal('');
  readonly formError  = signal<string | null>(null);
  readonly saving     = signal(false);

  readonly hasProfiles = computed(() => this.users().length > 0);
  /** `loaded` keeps the prompt from flashing over the tiles while the list is still in flight. */
  readonly showCreateForm = computed(() => this.creating() || (this.loaded() && !this.hasProfiles()));

  ngOnInit() {
    this.adminUsersService.listActive().subscribe({
      next: users => {
        this.users.set(users);
        this.loaded.set(true);
      },
      error: () => this.error.set('Unable to load profiles. Please refresh and try again.'),
    });
  }

  selectProfile(user: AdminUser) {
    this.selecting.set(true);
    this.error.set(null);
    this.sessionService.select(user.id, this.rememberMe()).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.selecting.set(false);
        this.error.set('That profile is no longer available.');
      },
    });
  }

  openCreateForm() {
    this.creating.set(true);
    this.nameField.set('');
    this.formError.set(null);
  }

  closeCreateForm() {
    this.creating.set(false);
    this.nameField.set('');
    this.formError.set(null);
  }

  createProfile() {
    if (!this.nameField().trim()) {
      this.formError.set('A name is required.');
      return;
    }

    this.saving.set(true);
    this.formError.set(null);

    this.sessionService.createProfile(this.nameField().trim(), this.rememberMe()).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => {
        this.saving.set(false);
        this.formError.set(err.error?.error ?? 'Unable to create profile.');
      },
    });
  }

  initials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
