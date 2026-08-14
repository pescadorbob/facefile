import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Palace, PalacesService } from '../../services/palaces.service';

/** Mirrors the rule in amplify/functions/_shared/palaceService.ts (S-3.3.1). */
const MIN_NAME_LENGTH = 2;
const NAME_TOO_SHORT = `A palace name must be at least ${MIN_NAME_LENGTH} characters.`;

@Component({
  selector: 'app-palaces',
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
    input[type=text] {
      width: 100%;
      border: 1px solid var(--border);
      padding: 10px 14px;
      font-family: 'Lora', serif;
      font-size: 0.95rem;
      background: var(--bg);
      color: var(--fg);
      outline: none;
      border-radius: 0;
      transition: border-color 0.15s;
    }
    input[type=text]:focus { border-color: var(--fg); }
  `],
  template: `
    <div class="min-h-screen flex flex-col" style="background:var(--bg)">

      <header class="sticky top-0 z-20 border-b flex items-center gap-4 px-5"
        style="background:var(--card);border-color:var(--border);height:52px;min-height:52px">
        <button (click)="goBack()" aria-label="Go back"
          style="background:none;border:none;cursor:pointer;font-family:'DM Mono',monospace;font-size:18px;color:var(--fg);line-height:1;padding:8px 0;flex-shrink:0">
          ←
        </button>
        <p class="flex-1 truncate" style="font-family:'Playfair Display',serif;font-size:15px;color:var(--fg)">
          Memory Palaces
        </p>
      </header>

      <main class="flex-1 overflow-y-auto">
        <div class="max-w-2xl mx-auto px-5 pt-8 pb-16">

          <!-- The form replaces the action rather than sitting beside it, so there is
               only ever one way to name a palace on screen at a time. -->
          @if (creating()) {
            <div class="border px-5 py-5 mb-8" style="background:var(--card);border-color:var(--border)">
              <p class="text-xs uppercase tracking-widest mb-2"
                style="font-family:'DM Mono',monospace;color:var(--muted)">Name</p>
              <input type="text" [value]="nameField()"
                (input)="nameField.set($any($event.target).value)"
                aria-label="Name"
                placeholder="e.g. Weekly Meeting Room" />

              <!-- Loci are optional here: they can equally be added later, when a
                   contact is placed. Order is the walking order, so rows stay in the
                   sequence they were added. -->
              <p class="text-xs uppercase tracking-widest mt-5 mb-2"
                style="font-family:'DM Mono',monospace;color:var(--muted)">Loci — optional, in walking order</p>

              @for (locus of lociFields(); track $index) {
                <div class="mb-2 flex items-center gap-2">
                  <span class="text-xs" style="font-family:'DM Mono',monospace;color:var(--muted);width:18px">{{ $index + 1 }}</span>
                  <input type="text" [value]="locus"
                    (input)="setLocus($index, $any($event.target).value)"
                    [attr.aria-label]="'Locus ' + ($index + 1)"
                    placeholder="e.g. Front doorstep" />
                </div>
              }

              <button type="button" (click)="addLocus()"
                class="border px-3 py-1 mt-2 text-xs uppercase tracking-widest"
                style="font-family:'DM Mono',monospace;color:var(--fg);background:transparent;border-color:var(--border)">
                + Add locus
              </button>

              @if (formError()) {
                <p data-testid="palace-form-error" class="mt-4"
                  style="font-family:'DM Mono',monospace;font-size:12px;color:var(--accent)">
                  {{ formError() }}
                </p>
              }

              <div class="flex gap-3 pt-5">
                <button type="button" (click)="createPalace()" [disabled]="saving()"
                  class="border px-4 py-2 text-xs uppercase tracking-widest"
                  style="font-family:'DM Mono',monospace;color:var(--bg);background:var(--fg);border-color:var(--fg)">
                  {{ saving() ? 'Creating…' : 'Create palace' }}
                </button>
                <button type="button" (click)="closeForm()"
                  class="border px-4 py-2 text-xs uppercase tracking-widest"
                  style="font-family:'DM Mono',monospace;color:var(--fg);background:transparent;border-color:var(--border)">
                  Cancel
                </button>
              </div>
            </div>
          } @else {
            <button type="button" (click)="openForm()"
              class="border px-4 py-2 mb-8 text-xs uppercase tracking-widest"
              style="font-family:'DM Mono',monospace;color:var(--fg);background:transparent;border-color:var(--fg)">
              + New palace
            </button>
          }

          @if (palaces().length === 0) {
            <p style="font-family:'Lora',serif;color:var(--muted)">No memory palaces yet.</p>
          } @else {
            <div class="space-y-3">
              @for (palace of palaces(); track palace.id) {
                <div data-testid="palace-row" class="border px-4 py-3"
                  style="background:var(--card);border-color:var(--border)">
                  <div class="flex items-center justify-between gap-4">
                    <span style="font-family:'Lora',serif;font-size:15px;color:var(--fg)">{{ palace.name }}</span>
                    <span class="text-xs whitespace-nowrap" style="font-family:'DM Mono',monospace;color:var(--muted)">
                      {{ palace.loci.length }} loci
                    </span>
                  </div>
                  @if (palace.loci.length > 0) {
                    <ol class="mt-2 space-y-1">
                      @for (locus of palace.loci; track locus.id) {
                        <li data-testid="locus-name" class="text-xs"
                          style="font-family:'DM Mono',monospace;color:var(--muted)">{{ locus.name }}</li>
                      }
                    </ol>
                  }
                </div>
              }
            </div>
          }

        </div>
      </main>

    </div>
  `,
})
export class PalacesComponent implements OnInit {
  private palacesService = inject(PalacesService);
  private router = inject(Router);

  readonly palaces = signal<Palace[]>([]);

  readonly creating    = signal(false);
  readonly nameField   = signal('');
  readonly lociFields  = signal<string[]>([]);
  readonly formError   = signal<string | null>(null);
  readonly saving      = signal(false);

  ngOnInit() {
    this.palacesService.list().subscribe({
      next: palaces => this.palaces.set(palaces),
      error: () => {},
    });
  }

  openForm() {
    this.creating.set(true);
    this.resetForm();
  }

  closeForm() {
    this.creating.set(false);
    this.resetForm();
  }

  addLocus() {
    this.lociFields.update(loci => [...loci, '']);
  }

  setLocus(index: number, value: string) {
    this.lociFields.update(loci => loci.map((locus, i) => (i === index ? value : locus)));
  }

  createPalace() {
    const name = this.nameField().trim();
    // Checked here as well as on the server so the shortest names — the common slip —
    // are answered without a round trip. Both report the same rule.
    if (name.length < MIN_NAME_LENGTH) {
      this.formError.set(NAME_TOO_SHORT);
      return;
    }

    this.saving.set(true);
    this.formError.set(null);

    const loci = this.lociFields().map(locus => locus.trim()).filter(locus => locus.length > 0);

    this.palacesService.create(name, loci).subscribe({
      // Appended rather than re-fetched: the list is ordered by creation, so the new
      // palace belongs on the end, and it shows up without a reload.
      next: palace => {
        this.palaces.update(palaces => [...palaces, palace]);
        this.saving.set(false);
        this.closeForm();
      },
      error: err => {
        this.saving.set(false);
        this.formError.set(err.error?.error ?? 'Unable to create palace.');
      },
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  private resetForm() {
    this.nameField.set('');
    this.lociFields.set([]);
    this.formError.set(null);
  }
}
