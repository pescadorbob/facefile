import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TutorialService } from '../../services/tutorial.service';

interface TutorialStep {
  number: number;
  title: string;
  body: string[];
  tips?: string[];
  hasVisual?: boolean;
}

const STEPS: TutorialStep[] = [
  {
    number: 1,
    title: 'Choose the right kind of palace',
    body: [
      'For names, your palace should be socially organized, not random.',
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
    body: [
      'When you meet someone: picture their face or defining feature, place them at a specific spot in your palace, then attach the name image to them at that location.',
      'This mirrors real-world recall — you usually see the person first, then need the name.',
      'The physical placement is what makes retrieval reliable. Don\'t skip it.',
    ],
  },
  {
    number: 3,
    title: 'Turn the name into an image',
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
    body: [
      'Within 10–60 seconds of placing someone in the palace: mentally walk to the spot, retrieve the image, and say their name out loud or silently.',
      'Later: greet them by name, write the name from memory, briefly visualize the image once more.',
    ],
    tips: [
      'Retrieval strengthens memory far more than re-exposure.',
      'If you skip this step, the palace won\'t hold.',
    ],
  },
  {
    number: 6,
    title: 'Reuse structured palaces',
    body: [
      'Instead of creating a new palace every time:',
      'Reuse the same meeting-room palace for every weekly standup. Reuse your office palace for coworkers. Retire images when people leave your environment.',
      'Predictability lowers effort without reducing effectiveness.',
    ],
  },
  {
    number: 7,
    title: 'Repair failures productively',
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
  template: `
    <div class="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">

        <!-- Header -->
        <div class="mb-6">
          <p class="text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-1">Memory Palace Fundamentals</p>
          <h1 class="text-2xl font-bold text-gray-900">Learn the 7-step technique</h1>
        </div>

        <!-- Step progress bar -->
        <div class="flex items-center gap-1 mb-8">
          @for (step of steps; track step.number) {
            <div
              class="h-2 flex-1 rounded-full transition-colors duration-300"
              [class]="step.number <= currentStep() ? 'bg-indigo-600' : 'bg-gray-200'"
            ></div>
          }
        </div>

        <!-- Completion screen -->
        @if (completed()) {
          <div class="text-center py-8">
            <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-3">Fundamentals Complete</h2>
            <p class="text-gray-500 max-w-sm mx-auto">
              You've learned all 7 memory palace fundamentals. Start adding people and put the technique into practice.
            </p>
          </div>

        } @else {

          <!-- Step content -->
          <div>
            <div class="flex items-center gap-3 mb-5">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold shrink-0">
                {{ currentStep() }}
              </span>
              <h2 class="text-xl font-bold text-gray-900">{{ currentStepData().title }}</h2>
              <span class="ml-auto text-sm text-gray-400">Step {{ currentStep() }} of {{ steps.length }}</span>
            </div>

            <div class="space-y-3 text-gray-700 mb-6">
              @for (line of currentStepData().body; track $index) {
                <p>{{ line }}</p>
              }
            </div>

            <!-- Visual example (step 4 only) -->
            @if (currentStepData().hasVisual) {
              <div class="rounded-xl bg-indigo-50 border border-indigo-100 p-5 mb-6">
                <p class="text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-3">Visual Example</p>
                <p class="text-sm font-medium text-gray-700 mb-4">
                  You meet <strong>Sarah</strong> at the conference room door.
                </p>
                <div class="grid grid-cols-3 gap-3 text-sm mb-4">
                  <div class="bg-white rounded-lg p-3 shadow-sm text-center">
                    <p class="text-xs text-gray-400 mb-1">Name Image</p>
                    <p class="font-semibold text-indigo-700">Sari</p>
                    <p class="text-xs text-gray-500">(sounds like "Sarah")</p>
                  </div>
                  <div class="bg-white rounded-lg p-3 shadow-sm text-center">
                    <p class="text-xs text-gray-400 mb-1">Location</p>
                    <p class="font-semibold text-indigo-700">Door</p>
                    <p class="text-xs text-gray-500">conference room</p>
                  </div>
                  <div class="bg-white rounded-lg p-3 shadow-sm text-center">
                    <p class="text-xs text-gray-400 mb-1">Interaction</p>
                    <p class="font-semibold text-indigo-700">Sari tangles</p>
                    <p class="text-xs text-gray-500">she can't open the door</p>
                  </div>
                </div>
                <div class="border-t border-indigo-100 pt-3">
                  <p class="text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-2">Meeting room palace</p>
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="text-left text-xs text-gray-400">
                        <th class="pb-1 font-medium">Spot</th>
                        <th class="pb-1 font-medium">Person</th>
                        <th class="pb-1 font-medium">Image</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-indigo-50">
                      @for (row of visualRows; track row.locus) {
                        <tr>
                          <td class="py-1 text-gray-500">{{ row.locus }}</td>
                          <td class="py-1 font-medium text-gray-800">{{ row.person }}</td>
                          <td class="py-1 text-gray-600">{{ row.image }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

            <!-- Tips / techniques -->
            @if (currentStepData().tips?.length) {
              <ul class="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 space-y-1.5">
                @for (tip of currentStepData().tips; track $index) {
                  <li class="flex gap-2 text-sm text-amber-800">
                    <span class="mt-0.5 shrink-0">&#x2022;</span>
                    <span>{{ tip }}</span>
                  </li>
                }
              </ul>
            }

            <!-- Next / complete button -->
            <button
              (click)="advance()"
              class="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold transition-colors duration-150 cursor-pointer"
            >
              {{ isLastStep() ? 'Complete tutorial' : 'Next step →' }}
            </button>
          </div>
        }

      </div>
    </div>
  `,
})
export class TutorialComponent implements OnInit {
  private tutorialService = inject(TutorialService);

  readonly steps = STEPS;
  readonly currentStep = signal(1);
  readonly completed = signal(false);

  readonly currentStepData = computed(() => STEPS[this.currentStep() - 1]);
  readonly isLastStep = computed(() => this.currentStep() === STEPS.length);

  readonly visualRows = [
    { locus: 'Door', person: 'Mark', image: 'A marker writing on his jacket' },
    { locus: 'Table', person: 'Nina', image: 'A knee (knee-na) tapping the table' },
    { locus: 'Screen', person: 'Paul', image: 'A pole he\'s leaning against' },
    { locus: 'Window', person: 'Rachel', image: 'A rake pulling in leaves' },
  ];

  ngOnInit() {
    this.tutorialService.getProgress().subscribe({
      next: (p) => {
        this.currentStep.set(p.currentStep);
        this.completed.set(p.completed);
      },
      error: () => {
        // Backend not reachable — start at step 1 without persistence
      },
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
}
