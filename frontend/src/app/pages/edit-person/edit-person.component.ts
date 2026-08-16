import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactsService } from '../../services/contacts.service';

// Matches multipart.ts's MAX_FILE_BYTES — kept in sync manually since the two run in
// different bundles (browser vs. Lambda) with no shared module between them.
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

// S-2.6: edits an existing contact's name and/or photo only — no palace/locus
// reassignment lives here, and no ReviewCard is touched (see contactsRepo.update).
@Component({
  selector: 'app-edit-person',
  standalone: true,
  styles: [`
    :host {
      --bg:     #f4ede0;
      --card:   #ede3d0;
      --fg:     #1e1710;
      --accent: #8c3a2a;
      --muted:  #6b5c45;
      --border: rgba(30,23,16,0.18);
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
    input[type=file] { display: none; }
    button { border-radius: 0; }
  `],
  template: `
    <div class="min-h-screen flex flex-col" style="background:var(--bg)">

      <!-- Header -->
      <header class="sticky top-0 z-20 border-b flex items-center gap-4 px-5"
        style="background:var(--card);border-color:var(--border);height:52px;min-height:52px">
        <button (click)="cancel()" aria-label="Go back"
          style="background:none;border:none;cursor:pointer;font-family:'DM Mono',monospace;font-size:18px;color:var(--fg);line-height:1;padding:8px 0;flex-shrink:0">
          ←
        </button>
        <p class="flex-1 truncate" style="font-family:'Playfair Display',serif;font-size:15px;color:var(--fg)">
          Edit Person
        </p>
      </header>

      <main class="flex-1 overflow-y-auto">
        <div class="max-w-2xl mx-auto px-5 pt-8 pb-16">

          @if (!loaded()) {
            <p style="font-family:'Lora',serif;color:var(--muted)">Loading…</p>
          } @else if (loadError()) {
            <p data-testid="edit-person-load-error" style="font-family:'Lora',serif;color:var(--accent)">
              Unable to load this contact.
            </p>
          } @else {
            <div class="space-y-7">

              <div>
                <p class="text-xs uppercase tracking-widest mb-2"
                  style="font-family:'DM Mono',monospace;color:var(--muted)">Name</p>
                <input type="text" aria-label="Name" [value]="name()"
                  (input)="name.set($any($event.target).value); nameError.set(false)" />
                @if (nameError()) {
                  <p data-testid="edit-person-name-error" class="mt-2 text-xs"
                    style="font-family:'DM Mono',monospace;color:var(--accent)">
                    A name is required.
                  </p>
                }
              </div>

              <div>
                <p class="text-xs uppercase tracking-widest mb-2"
                  style="font-family:'DM Mono',monospace;color:var(--muted)">Photo</p>
                <div class="border flex flex-col items-center justify-center gap-3 cursor-pointer py-6"
                  style="border-color:var(--border);background:var(--card);min-height:120px"
                  (click)="fileInput.click()">
                  @if (photoPreview()) {
                    <img [src]="photoPreview()" [alt]="name()"
                      style="width:96px;height:96px;border-radius:50%;object-fit:cover" />
                  } @else {
                    <span data-testid="photo-placeholder" class="flex items-center justify-center"
                      style="width:96px;height:96px;border-radius:50%;background:var(--bg);font-family:'Playfair Display',serif;font-size:26px;color:var(--fg)">
                      {{ initials(name()) }}
                    </span>
                  }
                  <span class="text-xs uppercase tracking-widest"
                    style="font-family:'DM Mono',monospace;color:var(--muted)">Tap to upload photo</span>
                  <input #fileInput type="file" accept="image/*" (change)="handleFile($event)" />
                </div>
                @if (photoPreview()) {
                  <button (click)="removePhoto()" aria-label="Remove Photo" class="mt-2 text-xs"
                    style="font-family:'DM Mono',monospace;color:var(--muted);background:none;border:none;cursor:pointer">
                    Remove photo
                  </button>
                }
              </div>

              @if (saveError()) {
                <p data-testid="edit-person-form-error"
                  style="font-family:'DM Mono',monospace;font-size:12px;color:var(--accent)">
                  {{ saveError() }}
                </p>
              }

              <div class="flex gap-3 pt-2">
                <button (click)="save()" [disabled]="saving()"
                  class="border px-4 py-2 text-xs uppercase tracking-widest"
                  style="font-family:'DM Mono',monospace;color:var(--bg);background:var(--fg);border-color:var(--fg);cursor:pointer">
                  {{ saving() ? 'Saving…' : 'Save changes' }}
                </button>
                <button (click)="cancel()"
                  class="border px-4 py-2 text-xs uppercase tracking-widest"
                  style="font-family:'DM Mono',monospace;color:var(--fg);background:transparent;border-color:var(--border);cursor:pointer">
                  Cancel
                </button>
              </div>

            </div>
          }

        </div>
      </main>

    </div>
  `,
})
export class EditPersonComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private contactsService = inject(ContactsService);

  private contactId = '';

  readonly loaded          = signal(false);
  readonly loadError       = signal(false);
  readonly name            = signal('');
  readonly nameError       = signal(false);
  readonly photoFile       = signal<File | null>(null);
  readonly photoPreview    = signal('');
  readonly removePhotoFlag = signal(false);
  readonly saving          = signal(false);
  readonly saveError       = signal<string | null>(null);
  /** Set while a just-chosen file fails validation, so Save is a no-op until it's replaced
   * or cleared — otherwise a click on a stale button would silently save everything else
   * and leave the rejected-photo error looking like it applied when it didn't. */
  readonly photoInvalid    = signal(false);

  ngOnInit() {
    this.contactId = this.route.snapshot.paramMap.get('id') ?? '';
    this.contactsService.get(this.contactId).subscribe({
      next: contact => {
        this.name.set(contact.name);
        this.photoPreview.set(contact.photoPath ?? '');
        this.loaded.set(true);
      },
      error: () => {
        this.loaded.set(true);
        this.loadError.set(true);
      },
    });
  }

  handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Checked here, not just server-side: a 5 MB+ file base64-inflates past API
    // Gateway's payload limit, which rejects it before the server's own multipart
    // parser ever gets a chance to return a friendly "File exceeds 5 MB limit" message.
    if (!file.type.startsWith('image/')) {
      this.saveError.set('Only image files are allowed.');
      this.photoInvalid.set(true);
      input.value = '';
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      this.saveError.set('File exceeds 5 MB limit.');
      this.photoInvalid.set(true);
      input.value = '';
      return;
    }

    this.saveError.set(null);
    this.photoInvalid.set(false);
    this.photoFile.set(file);
    this.removePhotoFlag.set(false);
    const reader = new FileReader();
    reader.onload = e => this.photoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  removePhoto() {
    this.photoFile.set(null);
    this.photoPreview.set('');
    this.removePhotoFlag.set(true);
    this.photoInvalid.set(false);
    this.saveError.set(null);
  }

  save() {
    if (this.photoInvalid()) return;
    if (!this.name().trim()) {
      this.nameError.set(true);
      return;
    }
    this.nameError.set(false);
    this.saveError.set(null);
    this.saving.set(true);
    this.contactsService.update(this.contactId, {
      name: this.name(),
      photo: this.photoFile(),
      removePhoto: this.removePhotoFlag(),
    }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.saving.set(false);
        this.saveError.set(err.error?.error ?? 'Unable to save changes.');
      },
    });
  }

  cancel() {
    this.router.navigate(['/dashboard']);
  }

  initials(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) return '?';
    return trimmed
      .split(/\s+/)
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
