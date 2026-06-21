import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TutorialService } from '../../services/tutorial.service';

interface TutorialStep {
  number: number;
  title: string;
  subtitle: string;
  body: string[];
  tips?: string[];
  hasVisual?: boolean;
}

const STEPS: TutorialStep[] = [
  {
    number: 1,
    title: 'Choose the right kind of palace',
    subtitle: 'The spatial foundation of name recall',
    body: [
      'For names, your palace should be socially organised, not random.',
      'Good options: your home (each room = a category), your office (each desk holds one colleague), or a standard meeting room reused across events with fixed spots.',
      'You don\'t need dozens of locations. 5–10 spots is plenty for most contexts.',
    ],
    tips: [
      'Build on existing mental structures to reduce cognitive load.',
      'The same meeting-room layout can be reused every week.',
    ],
  },
  {
    number: 2,
    title: 'Place the person, not just the name',
    subtitle: 'Anchor identity to a fixed location',
    body: [
      'When you meet someone: picture their face or defining feature, place them at a specific spot in your palace, then attach the name image to them at that location.',
      'This mirrors real-world recall — you usually see the person first, then need the name.',
      'The physical placement is what makes retrieval reliable. Don\'t skip it.',
    ],
  },
  {
    number: 3,
    title: 'Turn the name into an image',
    subtitle: 'From abstract to concrete in one step',
    body: [
      'You\'re not trying to be perfect — just distinctive enough to retrieve later.',
      'Three techniques that work:',
    ],
    tips: [
      'Sound-alike: "Ben" → a bent beam, "Lisa" → a laser',
      'Meaning-based: "Baker" → someone actually baking, "King" → a crown',
      'Split long names: "Anderson" → antler (Ander) + a young kid (son)',
    ],
  },
  {
    number: 4,
    title: 'Create an interaction',
    subtitle: 'Motion is the preservative of memory',
    body: [
      'A static image fades. An interaction sticks.',
      'Make the image interact with the person, interact with the location, and include motion or emotion.',
    ],
    hasVisual: true,
    tips: [
      'Bizarreness improves recall — the sillier the interaction, the better.',
      'Emotion (embarrassment, joy, surprise) adds another hook for retrieval.',
    ],
  },
  {
    number: 5,
    title: 'Do immediate retrieval',
    subtitle: 'Practice begins the moment you meet',
    body: [
      'Within 10–60 seconds of placing someone in the palace: mentally walk to the spot, retrieve the image, and say their name out loud or silently.',
      'Later: greet them by name, write the name from memory, briefly visualise the image once more.',
    ],
    tips: [
      'Retrieval strengthens memory far more than re-exposure.',
      'If you skip this step, the palace won\'t hold.',
    ],
  },
  {
    number: 6,
    title: 'Reuse structured palaces',
    subtitle: 'Economy of effort, consistency of recall',
    body: [
      'Instead of creating a new palace every time:',
      'Reuse the same meeting-room palace for every weekly standup. Reuse your office palace for coworkers. Retire images when people leave your environment.',
      'Predictability lowers effort without reducing effectiveness.',
    ],
  },
  {
    number: 7,
    title: 'Repair failures productively',
    subtitle: 'Every mistake strengthens the palace',
    body: [
      'If you forget a name, don\'t say "I\'m bad with names." That belief is self-fulfilling.',
      'Instead: reconstruct the palace, ask for their name again, and intentionally rebuild the image right there.',
      'Errors followed by correction produce stronger learning than flawless performance.',
    ],
    tips: [
      'The goal isn\'t a perfect palace — it\'s a repairable one.',
    ],
  },
];

@Component({
  selector: 'app-tutorial',
  standalone: true,
  styles: [`
    :host {
      --tut-bg: #f4ede0;
      --tut-card: #ede3d0;
      --tut-fg: #1e1710;
      --tut-accent: #8c3a2a;
      --tut-muted: #6b5c45;
      --tut-border: rgba(30, 23, 16, 0.18);
      --tut-secondary: #ddd3be;
      --tut-muted-bg: #d6c9b0;
      display: block;
    }
  `],
  template: `
    @if (completed()) {

      <!-- Completion screen -->
      <div class="min-h-screen flex flex-col items-center justify-center px-5 py-16" style="background: var(--tut-bg)">
        <div class="w-full max-w-sm text-center">

          <div class="flex justify-center mb-8">
            <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
              <circle cx="36" cy="36" r="34" fill="none" stroke="var(--tut-accent)" stroke-width="1.5"/>
              <circle cx="36" cy="36" r="26" fill="none" stroke="var(--tut-accent)" stroke-width="0.75"/>
              <text x="36" y="34" text-anchor="middle" dominant-baseline="middle"
                style="font-family:'Playfair Display',serif;font-size:20px;fill:var(--tut-accent)">✦</text>
              <text x="36" y="49" text-anchor="middle"
                style="font-family:'DM Mono',monospace;font-size:6.5px;fill:var(--tut-accent);letter-spacing:0.12em">VII / VII</text>
            </svg>
          </div>

          <p class="text-xs uppercase tracking-widest mb-3"
            style="font-family:'DM Mono',monospace;color:var(--tut-muted)">Fundamentals Complete</p>

          <h1 class="mb-5"
            style="font-family:'Playfair Display',serif;font-size:clamp(1.75rem,7vw,2.5rem);line-height:1.2;color:var(--tut-fg)">
            The Foundation Is Laid
          </h1>

          <p class="text-sm leading-relaxed mb-8"
            style="font-family:'Lora',serif;color:var(--tut-muted)">
            You have walked all seven fundamentals of the memory palace. The ancient technique is now
            yours to practice. Start adding faces to FaceFile tonight.
          </p>

          <div class="border text-left mb-8" style="border-color:var(--tut-border);background:var(--tut-card)">
            <div class="px-4 py-3 border-b" style="border-color:var(--tut-border)">
              <p class="text-xs uppercase tracking-widest"
                style="font-family:'DM Mono',monospace;color:var(--tut-muted)">Seven Fundamentals Mastered</p>
            </div>
            @for (s of steps; track s.number) {
              <div class="flex items-center gap-3 px-4 py-3 border-b last:border-0"
                style="border-color:var(--tut-border)">
                <span class="text-xs shrink-0"
                  style="font-family:'DM Mono',monospace;color:var(--tut-accent);min-width:18px">{{ padStep(s.number) }}</span>
                <span style="font-family:'Lora',serif;font-size:13.5px;color:var(--tut-fg);line-height:1.4">{{ s.title }}</span>
                <span class="ml-auto text-xs shrink-0" style="color:var(--tut-accent)">✓</span>
              </div>
            }
          </div>

          <button
            (click)="restart()"
            class="w-full py-4 border text-xs uppercase"
            style="font-family:'DM Mono',monospace;letter-spacing:0.09em;color:var(--tut-fg);border-color:var(--tut-fg);background:transparent;cursor:pointer"
          >
            Begin Again from Step I
          </button>

        </div>
      </div>

    } @else {

      <div class="min-h-screen flex flex-col" style="background:var(--tut-bg)">

        <!-- Sticky header -->
        <header class="sticky top-0 z-20 border-b px-5 flex items-center justify-between"
          style="background:var(--tut-card);border-color:var(--tut-border);height:52px;min-height:52px">
          <span style="font-family:'Playfair Display',serif;font-size:16px;color:var(--tut-fg)">The Memory Palace</span>
          <button
            (click)="menuOpen.set(!menuOpen())"
            class="flex items-center gap-2"
            style="background:none;border:none;cursor:pointer;padding:8px 0"
            aria-label="Toggle step list"
            [attr.aria-expanded]="menuOpen()"
          >
            <span class="text-xs tracking-widest" style="font-family:'DM Mono',monospace;color:var(--tut-muted)">
              {{ padStep(currentStep()) }} / 07
            </span>
            <span style="color:var(--tut-muted);font-size:18px;line-height:1">{{ menuOpen() ? '✕' : '≡' }}</span>
          </button>
        </header>

        <!-- Step drawer overlay -->
        @if (menuOpen()) {
          <div class="fixed inset-0 z-30 flex flex-col" style="padding-top:52px">
            <div class="absolute inset-0" style="background:rgba(30,23,16,0.4)"
              (click)="menuOpen.set(false)"></div>
            <div class="relative z-10 border-b overflow-y-auto"
              style="background:var(--tut-card);border-color:var(--tut-border);max-height:70vh">
              <div class="px-5 py-3 border-b" style="border-color:var(--tut-border)">
                <p class="text-xs uppercase tracking-widest"
                  style="font-family:'DM Mono',monospace;color:var(--tut-muted)">Seven Fundamentals</p>
              </div>
              @for (s of steps; track s.number) {
                <button
                  (click)="goTo(s.number)"
                  class="w-full flex items-center gap-4 px-5 text-left"
                  style="border:none;border-bottom:1px solid var(--tut-border);cursor:pointer;height:56px"
                  [style.background]="s.number === currentStep() ? 'var(--tut-secondary)' : 'transparent'"
                >
                  <span class="text-xs shrink-0"
                    style="font-family:'DM Mono',monospace;min-width:20px"
                    [style.color]="s.number < currentStep() ? 'var(--tut-accent)' : 'var(--tut-muted)'"
                  >{{ s.number < currentStep() ? '✓' : padStep(s.number) }}</span>
                  <span style="font-family:'Lora',serif;font-size:14.5px;color:var(--tut-fg)"
                    [style.opacity]="s.number > currentStep() ? 0.5 : 1"
                  >{{ s.title }}</span>
                  @if (s.number === currentStep()) {
                    <span class="ml-auto" style="color:var(--tut-accent);font-size:12px">●</span>
                  }
                </button>
              }
            </div>
          </div>
        }

        <!-- Progress bar -->
        <div class="shrink-0" style="height:2px;background:var(--tut-border)">
          <div class="h-full"
            [style.width]="progressPercent() + '%'"
            style="background:var(--tut-accent);transition:width 0.4s ease"></div>
        </div>

        <!-- Main content -->
        <main class="flex-1 overflow-y-auto pb-32">
          <div class="max-w-2xl mx-auto px-5 pt-8 pb-6">

            <!-- Step badge + subtitle -->
            <div class="flex items-center gap-3 mb-6">
              <div class="flex items-center justify-center border shrink-0"
                style="width:44px;height:44px;border-color:var(--tut-fg)">
                <span style="font-family:'DM Mono',monospace;font-size:15px;color:var(--tut-fg)">{{ padStep(currentStep()) }}</span>
              </div>
              <p class="text-xs uppercase tracking-wider leading-tight"
                style="font-family:'DM Mono',monospace;color:var(--tut-muted)">
                {{ currentStepData().subtitle }}
              </p>
            </div>

            <!-- Heading -->
            <h1 class="mb-6"
              style="font-family:'Playfair Display',serif;font-size:clamp(1.75rem,6vw,2.75rem);line-height:1.18;color:var(--tut-fg)">
              {{ currentStepData().title }}
            </h1>

            <!-- Ornamental divider -->
            <div class="flex items-center gap-3 mb-7">
              <div class="h-px flex-1" style="background:var(--tut-border)"></div>
              <span style="color:var(--tut-accent);font-size:9px">✦</span>
              <div class="h-px flex-1" style="background:var(--tut-border)"></div>
            </div>

            <!-- Body paragraphs -->
            <div class="space-y-5"
              style="font-family:'Lora',serif;font-size:1rem;line-height:1.82;color:var(--tut-fg)">
              @for (para of currentStepData().body; track $index) {
                <p>{{ para }}</p>
              }
            </div>

            <!-- Tips as em-dash list -->
            @if (currentStepData().tips?.length) {
              <ul class="mt-6 space-y-2 list-none p-0">
                @for (tip of currentStepData().tips!; track $index) {
                  <li class="flex gap-3"
                    style="font-family:'Lora',serif;font-size:0.9rem;line-height:1.7;color:var(--tut-muted)">
                    <span style="color:var(--tut-accent);flex-shrink:0;margin-top:2px">—</span>
                    <span>{{ tip }}</span>
                  </li>
                }
              </ul>
            }

            <!-- Visual example (step 4) -->
            @if (currentStepData().hasVisual) {
              <div class="mt-6 border p-4" style="border-color:var(--tut-border);background:var(--tut-card)">
                <p class="text-xs uppercase tracking-widest mb-4"
                  style="font-family:'DM Mono',monospace;color:var(--tut-muted)">
                  Fig. I — Interaction at Station · Meeting Room Palace
                </p>
                <div class="grid grid-cols-3 gap-3 mb-4">
                  @for (cell of visualCells; track cell.label) {
                    <div class="border p-3 text-center" style="border-color:var(--tut-border)">
                      <p class="text-xs mb-1" style="font-family:'DM Mono',monospace;color:var(--tut-muted)">{{ cell.label }}</p>
                      <p style="font-family:'Lora',serif;font-weight:500;color:var(--tut-accent);font-size:13px">{{ cell.primary }}</p>
                      <p class="text-xs mt-0.5" style="font-family:'Lora',serif;color:var(--tut-muted)">{{ cell.secondary }}</p>
                    </div>
                  }
                </div>
                <div class="border-t pt-3" style="border-color:var(--tut-border)">
                  <p class="text-xs uppercase tracking-widest mb-2"
                    style="font-family:'DM Mono',monospace;color:var(--tut-muted)">Meeting room palace</p>
                  <table class="w-full">
                    <thead>
                      <tr>
                        <th class="pb-1 text-left text-xs font-normal"
                          style="font-family:'DM Mono',monospace;color:var(--tut-muted)">Spot</th>
                        <th class="pb-1 text-left text-xs font-normal"
                          style="font-family:'DM Mono',monospace;color:var(--tut-muted)">Person</th>
                        <th class="pb-1 text-left text-xs font-normal"
                          style="font-family:'DM Mono',monospace;color:var(--tut-muted)">Image</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of visualRows; track row.locus) {
                        <tr style="border-top:1px solid var(--tut-border)">
                          <td class="py-1.5 text-xs"
                            style="font-family:'DM Mono',monospace;color:var(--tut-muted)">{{ row.locus }}</td>
                          <td class="py-1.5"
                            style="font-family:'Lora',serif;font-size:13px;color:var(--tut-fg)">{{ row.person }}</td>
                          <td class="py-1.5"
                            style="font-family:'Lora',serif;font-size:12px;color:var(--tut-muted)">{{ row.image }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
                <p class="mt-3 text-xs leading-relaxed" style="font-family:'Lora',serif;color:var(--tut-muted)">
                  You meet <em>Sarah</em> at the conference room door. A sari tangles in the handle —
                  the image plays, the name holds.
                </p>
              </div>
            }

          </div>
        </main>

        <!-- Sticky bottom nav -->
        <nav class="fixed bottom-0 left-0 right-0 z-20 border-t"
          style="background:var(--tut-card);border-color:var(--tut-border)">

          <!-- Step dots -->
          <div class="flex items-center justify-center gap-1.5 pt-3 pb-1">
            @for (s of steps; track s.number) {
              <button
                (click)="goTo(s.number)"
                [attr.aria-label]="'Go to step ' + s.number"
                [style.width.px]="s.number === currentStep() ? 24 : 7"
                [style.background]="s.number === currentStep() ? 'var(--tut-accent)' : s.number < currentStep() ? 'var(--tut-fg)' : 'var(--tut-muted-bg)'"
                style="height:7px;border-radius:2px;border:none;cursor:pointer;padding:0;transition:width 0.3s ease,background 0.3s ease"
              ></button>
            }
          </div>

          <!-- Prev / Next buttons -->
          <div class="flex gap-3 px-4 pb-5 pt-2">
            @if (currentStep() > 1) {
              <button
                (click)="goTo(currentStep() - 1)"
                class="flex items-center justify-center border"
                style="font-family:'DM Mono',monospace;font-size:13px;color:var(--tut-muted);border-color:var(--tut-border);background:transparent;cursor:pointer;height:52px;width:52px;flex-shrink:0"
                aria-label="Previous step"
              >←</button>
            } @else {
              <div style="width:52px;height:52px;flex-shrink:0"></div>
            }
            <button
              (click)="advance()"
              data-testid="advance-btn"
              class="flex-1 flex items-center justify-center border"
              style="font-family:'DM Mono',monospace;font-size:12px;letter-spacing:0.09em;text-transform:uppercase;color:var(--tut-fg);border-color:var(--tut-fg);background:transparent;cursor:pointer;height:52px"
            >
              {{ isLastStep() ? 'Complete Fundamentals' : 'Step ' + padStep(currentStep() + 1) + ' →' }}
            </button>
          </div>

        </nav>

      </div>

    }
  `,
})
export class TutorialComponent implements OnInit {
  private tutorialService = inject(TutorialService);

  readonly steps = STEPS;
  readonly currentStep = signal(1);
  readonly completed = signal(false);
  readonly menuOpen = signal(false);

  readonly currentStepData = computed(() => STEPS[this.currentStep() - 1]);
  readonly isLastStep = computed(() => this.currentStep() === STEPS.length);
  readonly progressPercent = computed(() => ((this.currentStep() - 1) / (STEPS.length - 1)) * 100);

  readonly visualCells = [
    { label: 'Name Image', primary: 'Sari', secondary: '(sounds like "Sarah")' },
    { label: 'Location', primary: 'Door', secondary: 'conference room entrance' },
    { label: 'Interaction', primary: 'Sari tangles', secondary: 'can\'t open the door' },
  ];

  readonly visualRows = [
    { locus: 'Door', person: 'Mark', image: 'A marker writing on his jacket' },
    { locus: 'Table', person: 'Nina', image: 'A knee tapping the table' },
    { locus: 'Screen', person: 'Paul', image: 'A pole he\'s leaning against' },
    { locus: 'Window', person: 'Rachel', image: 'A rake pulling in leaves' },
  ];

  padStep(n: number): string {
    return String(n).padStart(2, '0');
  }

  ngOnInit() {
    this.tutorialService.getProgress().subscribe({
      next: (p) => {
        this.currentStep.set(p.currentStep);
        this.completed.set(p.completed);
      },
      error: () => {},
    });
  }

  advance() {
    if (this.isLastStep()) {
      this.completed.set(true);
      this.tutorialService.saveProgress(STEPS.length, true).subscribe();
    } else {
      const next = this.currentStep() + 1;
      this.currentStep.set(next);
      this.tutorialService.saveProgress(next, false).subscribe();
    }
  }

  goTo(step: number) {
    this.currentStep.set(step);
    this.menuOpen.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  restart() {
    this.currentStep.set(1);
    this.completed.set(false);
    this.tutorialService.saveProgress(1, false).subscribe();
  }
}
