import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PalacesService, Palace, Locus } from '../../services/palaces.service';
import { ContactsService } from '../../services/contacts.service';

// Carries the in-progress name across the palace-creation detour (S-2.5.1 scenario 6)
// so the wizard can resume where the user left off rather than starting over.
const DRAFT_NAME_KEY = 'facefile:addPersonDraftName';

const WIZARD_STEPS = [
  { number: 1, title: 'Name & photo',       shortTitle: 'Name'   },
  { number: 2, title: 'Palace placement',   shortTitle: 'Palace' },
  { number: 3, title: 'Name image',         shortTitle: 'Image'  },
  { number: 4, title: 'Association scene',  shortTitle: 'Scene'  },
  { number: 5, title: 'Review & save',      shortTitle: 'Review' },
];

const NAME_HINTS = [
  {
    technique: 'Sound-alike',
    icon: '◎',
    description: '"Marcus" → "Marquee" — imagine a circus marquee tent pitched over him.',
  },
  {
    technique: 'Meaning',
    icon: '◈',
    description: '"Victoria" → victory — imagine a laurel wreath and a raised sword.',
  },
  {
    technique: 'Personal association',
    icon: '◇',
    description: 'Connect the name to someone you already know by that name. Let that person stand in as an avatar.',
  },
];

@Component({
  selector: 'app-add-person',
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
    input[type=text], textarea {
      width: 100%;
      border: 1px solid var(--border);
      padding: 12px 16px;
      font-family: 'Lora', serif;
      font-size: 1rem;
      background: var(--input);
      color: var(--fg);
      outline: none;
      border-radius: 0;
      resize: none;
      transition: border-color 0.15s;
    }
    input[type=text]:focus, textarea:focus { border-color: var(--fg); }
    input[type=file] { display: none; }
    button { border-radius: 0; }
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
          Add New Person
        </p>
        <span class="text-xs tracking-widest shrink-0"
          style="font-family:'DM Mono',monospace;color:var(--muted)">
          {{ padStep(step()) }} / 05
        </span>
      </header>

      <!-- Progress bar -->
      <div style="height:2px;background:var(--border);flex-shrink:0">
        <div style="height:100%;background:var(--accent);transition:width 0.4s ease"
          [style.width]="progressPct() + '%'"></div>
      </div>

      <!-- Step tabs -->
      <div class="flex border-b overflow-x-auto" style="background:var(--card);border-color:var(--border)">
        @for (s of wizardSteps; track s.number) {
          <div class="flex flex-col items-center px-4 py-2 shrink-0"
            [style.border-bottom]="s.number === step() ? '2px solid var(--accent)' : '2px solid transparent'"
            style="margin-bottom:-1px">
            <span style="font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.06em"
              [style.color]="s.number === step() ? 'var(--accent)' : s.number < step() ? 'var(--fg)' : 'var(--muted)'">
              {{ padStep(s.number) }}
            </span>
            <span style="font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.04em;white-space:nowrap"
              [style.color]="s.number <= step() ? 'var(--fg)' : 'var(--muted)'"
              [style.opacity]="s.number > step() ? '0.5' : '1'">
              {{ s.shortTitle }}
            </span>
          </div>
        }
      </div>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto pb-32">
        <div class="max-w-2xl mx-auto px-5 pt-8 pb-6">

          <!-- Section label -->
          <div class="inline-block border px-3 py-1.5 mb-5" style="background:var(--fg);border-color:var(--fg)">
            <span class="text-xs uppercase tracking-widest"
              style="font-family:'DM Mono',monospace;color:var(--bg)">
              Step {{ step() }} of 5
            </span>
          </div>

          <!-- Step heading -->
          <h1 class="mb-7" style="font-family:'Playfair Display',serif;font-size:clamp(1.5rem,5vw,2.25rem);line-height:1.2;color:var(--fg)">
            {{ currentStepMeta().title }}
          </h1>

          <!-- Divider -->
          <div class="flex items-center gap-3 mb-8">
            <div class="h-px flex-1" style="background:var(--border)"></div>
            <span style="color:var(--accent);font-size:9px">✦</span>
            <div class="h-px flex-1" style="background:var(--border)"></div>
          </div>

          <!-- ── Step 1: Name & photo ── -->
          @if (step() === 1) {
            <div class="space-y-7">

              <div>
                <p class="text-xs uppercase tracking-widest mb-2"
                  style="font-family:'DM Mono',monospace;color:var(--muted)">Full name</p>
                <input type="text" [value]="name()"
                  (input)="name.set($any($event.target).value); nameError.set(false)"
                  placeholder="e.g. Margaret Holloway"
                  autofocus />
                @if (nameError()) {
                  <p class="mt-2 text-xs" style="font-family:'DM Mono',monospace;color:var(--accent)">
                    A name is required to continue.
                  </p>
                }
              </div>

              <div>
                <p class="text-xs uppercase tracking-widest mb-2"
                  style="font-family:'DM Mono',monospace;color:var(--muted)">Photo (optional)</p>
                <div class="border flex flex-col items-center justify-center gap-3 cursor-pointer"
                  style="border-color:var(--border);background:var(--card);min-height:120px;position:relative;overflow:hidden"
                  (click)="fileInput.click()">
                  @if (photoPreview()) {
                    <img [src]="photoPreview()" alt="Person photo"
                      class="w-full object-cover" style="max-height:220px" />
                  } @else {
                    <span style="font-size:28px;color:var(--muted)">+</span>
                    <span class="text-xs uppercase tracking-widest"
                      style="font-family:'DM Mono',monospace;color:var(--muted)">Tap to upload photo</span>
                  }
                  <input #fileInput type="file" accept="image/*" (change)="handleFile($event)" />
                </div>
                @if (photoPreview()) {
                  <button (click)="clearPhoto()" class="mt-2 text-xs"
                    style="font-family:'DM Mono',monospace;color:var(--muted);background:none;border:none;cursor:pointer">
                    Remove photo
                  </button>
                }
              </div>

            </div>
          }

          <!-- ── Step 2: Palace placement ── -->
          @if (step() === 2) {
            <div class="space-y-7">

              <div>
                <p class="text-xs uppercase tracking-widest mb-2"
                  style="font-family:'DM Mono',monospace;color:var(--muted)">Choose a palace</p>
                @if (palacesLoaded() && palaces().length === 0) {
                  <p class="text-sm" style="font-family:'Lora',serif;color:var(--muted)">
                    No palaces yet — taking you to create one…
                  </p>
                }
                <div class="space-y-2">
                  @for (palace of palaces(); track palace.id) {
                    <button class="w-full flex items-center justify-between px-4 py-3 border text-left"
                      style="cursor:pointer;border-radius:0"
                      [style.background]="palaceId() === palace.id ? 'var(--fg)' : 'var(--card)'"
                      [style.border-color]="palaceId() === palace.id ? 'var(--fg)' : 'var(--border)'"
                      (click)="selectPalace(palace.id)">
                      <span style="font-family:'Lora',serif;font-size:15px"
                        [style.color]="palaceId() === palace.id ? 'var(--bg)' : 'var(--fg)'">
                        {{ palace.name }}
                      </span>
                      <span class="text-xs"
                        style="font-family:'DM Mono',monospace"
                        [style.color]="palaceId() === palace.id ? 'var(--dim)' : 'var(--muted)'">
                        {{ palace.loci.length }} loci
                      </span>
                    </button>
                  }
                </div>
              </div>

              @if (selectedPalace()) {
                <div>
                  <p class="text-xs uppercase tracking-widest mb-2"
                    style="font-family:'DM Mono',monospace;color:var(--muted)">
                    Choose a locus in {{ selectedPalace()!.name }}
                  </p>
                  <div class="flex flex-wrap gap-2">
                    @for (locus of selectedPalace()!.loci; track locus.id) {
                      <button class="px-3 py-2 text-xs border text-left"
                        style="font-family:'DM Mono',monospace;letter-spacing:0.04em;cursor:pointer;border-radius:0"
                        [style.background]="locusId() === locus.id ? 'var(--fg)' : 'transparent'"
                        [style.color]="locusId() === locus.id ? 'var(--bg)' : 'var(--fg)'"
                        [style.border-color]="locusId() === locus.id ? 'var(--fg)' : 'var(--border)'"
                        (click)="locusId.set(locus.id)">
                        {{ locus.name }}
                      </button>
                    }
                  </div>
                </div>
              } @else {
                <p class="text-xs" style="font-family:'DM Mono',monospace;color:var(--muted)">
                  Select a palace to see its loci.
                </p>
              }

            </div>
          }

          <!-- ── Step 3: Name image ── -->
          @if (step() === 3) {
            <div class="space-y-7">

              @if (selectedLocus()) {
                <div class="border flex items-center gap-3 px-4 py-3"
                  style="background:var(--card);border-color:var(--border)">
                  <span class="text-xs" style="font-family:'DM Mono',monospace;color:var(--muted)">Locus</span>
                  <span style="font-family:'Lora',serif;font-size:14px;color:var(--fg)">
                    {{ selectedLocus()!.name }}
                  </span>
                </div>
              }

              <div class="text-center py-4">
                <p class="text-xs uppercase tracking-widest mb-2"
                  style="font-family:'DM Mono',monospace;color:var(--muted)">The name to encode</p>
                <p data-testid="prominent-name" style="font-family:'Playfair Display',serif;font-size:clamp(2rem,8vw,3rem);color:var(--fg);line-height:1.1">
                  {{ name() }}
                </p>
              </div>

              <div>
                <p class="text-xs uppercase tracking-widest mb-2"
                  style="font-family:'DM Mono',monospace;color:var(--muted)">
                  Technique hints — tap to expand
                </p>
                <div class="space-y-2">
                  @for (hint of nameHints; track $index) {
                    <div class="border" style="background:var(--card);border-color:var(--border)">
                      <button class="w-full flex items-center gap-3 px-4 py-3 text-left"
                        style="background:none;border:none;cursor:pointer"
                        (click)="toggleHint($index)">
                        <span style="color:var(--accent);font-size:16px;min-width:20px">{{ hint.icon }}</span>
                        <span style="font-family:'DM Mono',monospace;font-size:12px;letter-spacing:0.06em;color:var(--fg);text-transform:uppercase">
                          {{ hint.technique }}
                        </span>
                        <span class="ml-auto" style="color:var(--muted);font-size:14px">
                          {{ expandedHint() === $index ? '−' : '+' }}
                        </span>
                      </button>
                      @if (expandedHint() === $index) {
                        <div class="px-4 pb-4 pt-3 border-t" style="border-color:var(--border)">
                          <p style="font-family:'Lora',serif;font-size:14px;line-height:1.7;color:var(--fg)">
                            {{ hint.description }}
                          </p>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>

              <div>
                <p class="text-xs uppercase tracking-widest mb-2"
                  style="font-family:'DM Mono',monospace;color:var(--muted)">
                  Your name image for "{{ name() }}"
                </p>
                <textarea rows="3" [value]="nameImage()"
                  (input)="nameImage.set($any($event.target).value)"
                  placeholder="Describe a concrete image or object that represents this name…"></textarea>
              </div>

            </div>
          }

          <!-- ── Step 4: Association scene ── -->
          @if (step() === 4) {
            <div class="space-y-7">

              @if (selectedLocus()) {
                <div class="border flex items-center gap-3 px-4 py-3"
                  style="background:var(--card);border-color:var(--border)">
                  <span class="text-xs" style="font-family:'DM Mono',monospace;color:var(--muted)">Locus</span>
                  <span style="font-family:'Lora',serif;font-size:14px;color:var(--fg)">
                    {{ selectedLocus()!.name }}
                  </span>
                </div>
              }

              <div class="border px-4 py-4 space-y-1" style="background:var(--card);border-color:var(--border)">
                <p class="text-xs uppercase tracking-widest"
                  style="font-family:'DM Mono',monospace;color:var(--muted)">Name</p>
                <p style="font-family:'Playfair Display',serif;font-size:1.4rem;color:var(--fg)">{{ name() }}</p>
                @if (nameImage()) {
                  <p class="text-xs uppercase tracking-widest pt-2"
                    style="font-family:'DM Mono',monospace;color:var(--muted)">Name image</p>
                  <p style="font-family:'Lora',serif;font-size:14px;line-height:1.65;color:var(--fg)">
                    {{ nameImage() }}
                  </p>
                }
              </div>

              <div>
                <p class="text-xs uppercase tracking-widest mb-2"
                  style="font-family:'DM Mono',monospace;color:var(--muted)">Write your association scene</p>
                <p class="text-sm mb-3 leading-relaxed"
                  style="font-family:'Lora',serif;color:var(--muted)">
                  Place {{ name() }} and their name image at the locus. What are they doing?
                  Make it vivid, absurd, and sensory — motion, sound, smell. The wilder the better.
                </p>
                <textarea rows="6" [value]="associationScene()"
                  (input)="associationScene.set($any($event.target).value)"
                  [placeholder]="'e.g. ' + name() + ' is balanced on the coat rack juggling glowing marquee lights while shouting their name…'"></textarea>
              </div>

            </div>
          }

          <!-- ── Step 5: Review & save ── -->
          @if (step() === 5) {
            <div class="space-y-6">

              @if (photoPreview()) {
                <img [src]="photoPreview()" [alt]="name()" class="w-full object-cover border"
                  style="max-height:200px;border-color:var(--border)" />
              }

              <div class="border divide-y" style="background:var(--card);border-color:var(--border)">
                @for (row of reviewRows(); track row.label) {
                  <div class="px-4 py-3" style="border-color:var(--border)">
                    <p class="text-xs uppercase tracking-widest mb-1"
                      style="font-family:'DM Mono',monospace;color:var(--muted)">{{ row.label }}</p>
                    <p style="font-size:14.5px;line-height:1.65;font-family:'Lora',serif"
                      [style.font-style]="row.italic ? 'italic' : 'normal'"
                      [style.color]="row.value === '—' ? 'var(--muted)' : 'var(--fg)'">
                      {{ row.value }}
                    </p>
                  </div>
                }
              </div>

              <p class="text-xs text-center"
                style="font-family:'DM Mono',monospace;color:var(--muted)">
                Review the details above. Tap Save to store this contact and begin reinforcing the memory.
              </p>

            </div>
          }

        </div>
      </main>

      <!-- Sticky bottom nav -->
      <nav class="fixed bottom-0 left-0 right-0 z-20 border-t"
        style="background:var(--card);border-color:var(--border)">

        <!-- Progress dots -->
        <div class="flex items-center justify-center gap-1.5 pt-3 pb-1">
          @for (s of wizardSteps; track s.number) {
            <div style="height:7px;border-radius:2px;transition:width 0.3s ease,background 0.3s ease"
              [style.width]="s.number === step() ? '24px' : '7px'"
              [style.background]="s.number === step() ? 'var(--accent)' : s.number < step() ? 'var(--fg)' : 'var(--dim)'">
            </div>
          }
        </div>

        <div class="flex gap-3 px-4 pb-5 pt-2">
          <button (click)="goBack()" aria-label="Go back" data-testid="wizard-back-btn"
            class="flex items-center justify-center border shrink-0"
            style="font-family:'DM Mono',monospace;font-size:13px;color:var(--muted);border-color:var(--border);background:transparent;cursor:pointer;height:52px;width:52px">
            ←
          </button>
          <button (click)="advance()" [disabled]="saving()" data-testid="wizard-continue-btn"
            class="flex-1 flex items-center justify-center border"
            style="font-family:'DM Mono',monospace;font-size:12px;letter-spacing:0.09em;text-transform:uppercase;background:transparent;height:52px;cursor:pointer;transition:opacity 0.15s"
            [style.color]="canProceed() ? 'var(--fg)' : 'var(--muted)'"
            [style.border-color]="canProceed() ? 'var(--fg)' : 'var(--border)'"
            [style.opacity]="canProceed() ? '1' : '0.5'"
            [style.cursor]="canProceed() ? 'pointer' : 'not-allowed'">
            @if (saving()) {
              Saving…
            } @else if (step() === 5) {
              Save &amp; Begin Quiz →
            } @else {
              Continue to {{ wizardSteps[step()]?.shortTitle ?? 'Review' }} →
            }
          </button>
        </div>

      </nav>

    </div>
  `,
})
export class AddPersonComponent implements OnInit {
  private palacesService = inject(PalacesService);
  private contactsService = inject(ContactsService);
  private router = inject(Router);

  readonly wizardSteps = WIZARD_STEPS;
  readonly nameHints = NAME_HINTS;

  readonly step             = signal(1);
  readonly name             = signal('');
  readonly photoFile        = signal<File | null>(null);
  readonly photoPreview     = signal('');
  readonly palaceId         = signal<string | null>(null);
  readonly locusId          = signal<string | null>(null);
  readonly nameImage        = signal('');
  readonly associationScene = signal('');
  readonly expandedHint     = signal<number | null>(null);
  readonly palaces          = signal<Palace[]>([]);
  readonly palacesLoaded    = signal(false);
  readonly saving           = signal(false);
  readonly nameError        = signal(false);

  readonly currentStepMeta  = computed(() => WIZARD_STEPS[this.step() - 1]);
  readonly progressPct      = computed(() => ((this.step() - 1) / (WIZARD_STEPS.length - 1)) * 100);
  readonly canProceed       = computed(() => this.step() !== 1 || this.name().trim().length > 0);
  readonly selectedPalace   = computed(() => this.palaces().find(p => p.id === this.palaceId()) ?? null);
  readonly selectedLocus    = computed(() => {
    const p = this.selectedPalace();
    return p ? (p.loci.find(l => l.id === this.locusId()) ?? null) : null;
  });
  readonly reviewRows = computed(() => {
    const palace = this.selectedPalace();
    const locus  = this.selectedLocus();
    return [
      { label: 'Name',              value: this.name(),              italic: false },
      { label: 'Palace',            value: palace?.name ?? '—',      italic: false },
      { label: 'Locus',             value: locus?.name  ?? '—',      italic: false },
      { label: 'Name image',        value: this.nameImage()        || '—', italic: true },
      { label: 'Association scene', value: this.associationScene() || '—', italic: true },
    ];
  });

  constructor() {
    // Step 2 needs a palace to place the person in; a user with none is sent to create
    // one first rather than shown an empty picker (S-2.5.1 scenario 6).
    effect(() => {
      if (this.step() === 2 && this.palacesLoaded() && this.palaces().length === 0) {
        this.redirectToCreatePalace();
      }
    });
  }

  ngOnInit() {
    const draftName = sessionStorage.getItem(DRAFT_NAME_KEY);
    if (draftName) {
      this.name.set(draftName);
      // A draft only exists because the redirect fired from step 2 — resume there
      // rather than making the user retype the name and step through step 1 again.
      this.step.set(2);
      sessionStorage.removeItem(DRAFT_NAME_KEY);
    }
    this.palacesService.list().subscribe({
      next: ps => { this.palaces.set(ps); this.palacesLoaded.set(true); },
      error: () => this.palacesLoaded.set(true),
    });
  }

  private redirectToCreatePalace() {
    if (this.name().trim()) {
      sessionStorage.setItem(DRAFT_NAME_KEY, this.name().trim());
    }
    this.router.navigate(['/palaces'], { queryParams: { returnTo: '/persons/new' } });
  }

  handleFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.photoFile.set(file);
    const reader = new FileReader();
    reader.onload = e => this.photoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  clearPhoto() {
    this.photoFile.set(null);
    this.photoPreview.set('');
  }

  selectPalace(id: string) {
    this.palaceId.set(id);
    this.locusId.set(null);
  }

  toggleHint(i: number) {
    this.expandedHint.set(this.expandedHint() === i ? null : i);
  }

  advance() {
    if (this.step() === 1 && !this.name().trim()) {
      this.nameError.set(true);
      return;
    }
    this.nameError.set(false);
    if (this.step() < 5) {
      this.step.update(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.save();
    }
  }

  goBack() {
    if (this.step() === 1) {
      this.router.navigate(['/']);
    } else {
      this.step.update(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  save() {
    this.saving.set(true);
    this.contactsService.create({
      name:             this.name(),
      palaceId:         this.palaceId(),
      locusId:          this.locusId(),
      nameImage:        this.nameImage(),
      associationScene: this.associationScene(),
      photo:            this.photoFile(),
    }).subscribe({
      // Straight into a one-question quiz on the person just saved — the retrieval
      // attempt has to land inside the window where the face is still in working
      // memory (E-4.8), so there is no interstitial between saving and being asked.
      next:  contact => this.router.navigate(['/quiz'], { queryParams: { contactId: contact.id } }),
      error: () => this.saving.set(false),
    });
  }

  padStep(n: number): string {
    return String(n).padStart(2, '0');
  }
}
