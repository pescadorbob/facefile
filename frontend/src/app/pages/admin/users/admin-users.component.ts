import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminUser, AdminUsersService } from '../../../services/admin-users.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  styles: [`
    :host {
      --bg:     #f4ede0;
      --card:   #ede3d0;
      --fg:     #1e1710;
      --accent: #8c3a2a;
      --muted:  #6b5c45;
      --border: rgba(30,23,16,0.18);
      --dim:    #d6c9b0;
      --input:  #f4ede0;
      display: block;
    }
    input[type=text] {
      width: 100%;
      border: 1px solid var(--border);
      padding: 12px 16px;
      font-family: 'Lora', serif;
      font-size: 1rem;
      background: var(--input);
      color: var(--fg);
      outline: none;
      border-radius: 0;
      transition: border-color 0.15s;
    }
    input[type=text]:focus { border-color: var(--fg); }
    button { border-radius: 0; }
    table { border-collapse: collapse; }
  `],
  template: `
    <div class="min-h-screen flex flex-col" style="background:var(--bg)">

      <!-- Header -->
      <header class="sticky top-0 z-20 border-b flex items-center gap-4 px-5"
        style="background:var(--card);border-color:var(--border);height:52px;min-height:52px">
        <button (click)="goBack()" aria-label="Go back"
          style="background:none;border:none;cursor:pointer;font-family:'DM Mono',monospace;font-size:18px;color:var(--fg);line-height:1;padding:8px 0;flex-shrink:0">
          ←
        </button>
        <p class="flex-1 truncate" style="font-family:'Playfair Display',serif;font-size:15px;color:var(--fg)">
          User Management
        </p>
        <button (click)="openCreateForm()"
          class="text-xs uppercase tracking-widest border px-3 py-2 shrink-0"
          style="font-family:'DM Mono',monospace;color:var(--fg);border-color:var(--fg);background:transparent;cursor:pointer">
          + Add user
        </button>
      </header>

      <main class="flex-1 overflow-y-auto">
        <div class="max-w-3xl mx-auto px-5 pt-8 pb-16">

          <!-- Create / edit form -->
          @if (formMode() !== 'closed') {
            <div class="border mb-8 px-5 py-5" style="background:var(--card);border-color:var(--border)">
              <p class="text-xs uppercase tracking-widest mb-4"
                style="font-family:'DM Mono',monospace;color:var(--muted)">
                {{ formMode() === 'create' ? 'New user' : 'Edit user' }}
              </p>

              <div class="space-y-4">
                <div>
                  <p class="text-xs uppercase tracking-widest mb-2"
                    style="font-family:'DM Mono',monospace;color:var(--muted)">Name</p>
                  <input type="text" [value]="nameField()"
                    (input)="nameField.set($any($event.target).value)"
                    placeholder="e.g. Jordan Lee" />
                </div>
                <div>
                  <p class="text-xs uppercase tracking-widest mb-2"
                    style="font-family:'DM Mono',monospace;color:var(--muted)">Email</p>
                  <input type="text" [value]="emailField()"
                    (input)="emailField.set($any($event.target).value)"
                    placeholder="e.g. jordan.lee@example.com" />
                </div>

                @if (formError()) {
                  <p style="font-family:'DM Mono',monospace;font-size:12px;color:var(--accent)">
                    {{ formError() }}
                  </p>
                }

                <div class="flex gap-3 pt-2">
                  <button (click)="save()" [disabled]="saving()"
                    class="border px-4 py-2 text-xs uppercase tracking-widest"
                    style="font-family:'DM Mono',monospace;color:var(--bg);background:var(--fg);border-color:var(--fg);cursor:pointer">
                    {{ saving() ? 'Saving…' : (formMode() === 'create' ? 'Create user' : 'Save changes') }}
                  </button>
                  <button (click)="closeForm()"
                    class="border px-4 py-2 text-xs uppercase tracking-widest"
                    style="font-family:'DM Mono',monospace;color:var(--fg);background:transparent;border-color:var(--border);cursor:pointer">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- User list -->
          @if (users().length === 0) {
            <div class="border px-5 py-10 text-center" style="background:var(--card);border-color:var(--border)">
              <p style="font-family:'Lora',serif;color:var(--muted)">
                No user accounts yet.
              </p>
              <button (click)="openCreateForm()" class="mt-3 text-xs uppercase tracking-widest"
                style="font-family:'DM Mono',monospace;color:var(--accent);background:none;border:none;cursor:pointer">
                Add the first user →
              </button>
            </div>
          } @else {
            <table class="w-full border" style="background:var(--card);border-color:var(--border)">
              <thead>
                <tr class="border-b" style="border-color:var(--border)">
                  <th class="text-left px-4 py-3 text-xs uppercase tracking-widest" style="font-family:'DM Mono',monospace;color:var(--muted)">Name</th>
                  <th class="text-left px-4 py-3 text-xs uppercase tracking-widest" style="font-family:'DM Mono',monospace;color:var(--muted)">Email</th>
                  <th class="text-left px-4 py-3 text-xs uppercase tracking-widest" style="font-family:'DM Mono',monospace;color:var(--muted)">Status</th>
                  <th class="text-left px-4 py-3 text-xs uppercase tracking-widest" style="font-family:'DM Mono',monospace;color:var(--muted)">Created</th>
                  <th class="text-left px-4 py-3 text-xs uppercase tracking-widest" style="font-family:'DM Mono',monospace;color:var(--muted)">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (u of users(); track u.id) {
                  <tr class="border-b" style="border-color:var(--border)">
                    <td class="px-4 py-3" style="font-family:'Lora',serif;font-size:14.5px;color:var(--fg)">{{ u.name }}</td>
                    <td class="px-4 py-3" style="font-family:'Lora',serif;font-size:14.5px;color:var(--fg)">{{ u.email }}</td>
                    <td class="px-4 py-3">
                      <span class="text-xs uppercase tracking-widest"
                        style="font-family:'DM Mono',monospace"
                        [style.color]="u.active ? '#3f6b3f' : 'var(--muted)'">
                        {{ u.active ? 'Active' : 'Deactivated' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-xs" style="font-family:'DM Mono',monospace;color:var(--muted)">
                      {{ formatDate(u.createdAt) }}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex gap-3">
                        <button (click)="openEditForm(u)"
                          class="text-xs uppercase tracking-widest"
                          style="font-family:'DM Mono',monospace;color:var(--fg);background:none;border:none;cursor:pointer">
                          Edit
                        </button>
                        @if (u.active) {
                          <button (click)="deactivate(u)"
                            class="text-xs uppercase tracking-widest"
                            style="font-family:'DM Mono',monospace;color:var(--accent);background:none;border:none;cursor:pointer">
                            Deactivate
                          </button>
                        } @else {
                          <button (click)="reactivate(u)"
                            class="text-xs uppercase tracking-widest"
                            style="font-family:'DM Mono',monospace;color:var(--accent);background:none;border:none;cursor:pointer">
                            Reactivate
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }

        </div>
      </main>

    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  private adminUsersService = inject(AdminUsersService);
  private router = inject(Router);

  readonly users     = signal<AdminUser[]>([]);
  readonly formMode  = signal<'closed' | 'create' | 'edit'>('closed');
  readonly editingId = signal<number | null>(null);
  readonly nameField  = signal('');
  readonly emailField = signal('');
  readonly formError  = signal<string | null>(null);
  readonly saving     = signal(false);

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.adminUsersService.list().subscribe({
      next: users => this.users.set(users),
      error: () => {},
    });
  }

  openCreateForm() {
    this.formMode.set('create');
    this.editingId.set(null);
    this.nameField.set('');
    this.emailField.set('');
    this.formError.set(null);
  }

  openEditForm(user: AdminUser) {
    this.formMode.set('edit');
    this.editingId.set(user.id);
    this.nameField.set(user.name);
    this.emailField.set(user.email);
    this.formError.set(null);
  }

  closeForm() {
    this.formMode.set('closed');
    this.editingId.set(null);
    this.formError.set(null);
  }

  save() {
    if (!this.nameField().trim()) {
      this.formError.set('A name is required.');
      return;
    }
    if (!this.emailField().trim()) {
      this.formError.set('An email address is required.');
      return;
    }

    this.saving.set(true);
    this.formError.set(null);

    const payload = { name: this.nameField().trim(), email: this.emailField().trim() };
    const request = this.formMode() === 'create'
      ? this.adminUsersService.create(payload)
      : this.adminUsersService.update(this.editingId()!, payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.refresh();
      },
      error: err => {
        this.saving.set(false);
        this.formError.set(err.error?.error ?? 'Unable to save user.');
      },
    });
  }

  deactivate(user: AdminUser) {
    this.adminUsersService.deactivate(user.id).subscribe({
      next: () => this.refresh(),
      error: () => {},
    });
  }

  reactivate(user: AdminUser) {
    this.adminUsersService.reactivate(user.id).subscribe({
      next: () => this.refresh(),
      error: () => {},
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
