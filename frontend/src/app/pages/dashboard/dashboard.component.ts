import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Contact, ContactsService } from '../../services/contacts.service';
import { DashboardMetrics, DashboardService } from '../../services/dashboard.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-dashboard',
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
  `],
  template: `
    <div class="min-h-screen flex flex-col" style="background:var(--bg)">

      <!-- Header -->
      <header class="sticky top-0 z-20 border-b flex items-center gap-5 px-5"
        style="background:var(--card);border-color:var(--border);height:52px;min-height:52px">
        <p class="flex-1 truncate" style="font-family:'Playfair Display',serif;font-size:16px;color:var(--fg)">
          FaceFile
        </p>
        <button (click)="goToAdmin()"
          style="background:none;border:none;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.04em;color:var(--muted)">
          Admin
        </button>
        <button (click)="goToMeetings()"
          style="background:none;border:none;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.04em;color:var(--muted)">
          Meetings
        </button>
        <button (click)="switchProfile()"
          style="background:none;border:none;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.04em;color:var(--muted)">
          Switch profile
        </button>
      </header>

      <main class="flex-1 overflow-y-auto">
        <div class="max-w-3xl mx-auto px-5 pt-6 pb-16">

          <!-- Metrics row -->
          @if (metrics(); as m) {
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div class="border px-4 py-3" data-testid="people-added-tile" style="background:var(--card);border-color:var(--border)">
                <p class="text-xs uppercase tracking-widest mb-1" style="font-family:'DM Mono',monospace;color:var(--muted)">People added</p>
                <p style="font-family:'Playfair Display',serif;font-size:1.6rem;color:var(--fg)">{{ m.peopleAdded }}</p>
              </div>
              <div class="border px-4 py-3" data-testid="due-review-tile"
                [attr.data-highlighted]="m.cardsDue > 0"
                [style.background]="m.cardsDue > 0 ? 'var(--accent)' : 'var(--card)'"
                [style.border-color]="m.cardsDue > 0 ? 'var(--accent)' : 'var(--border)'">
                <p class="text-xs uppercase tracking-widest mb-1"
                  style="font-family:'DM Mono',monospace"
                  [style.color]="m.cardsDue > 0 ? 'var(--bg)' : 'var(--muted)'">Due for review</p>
                <p style="font-family:'Playfair Display',serif;font-size:1.6rem"
                  [style.color]="m.cardsDue > 0 ? 'var(--bg)' : 'var(--fg)'">{{ m.cardsDue }}</p>
              </div>
              <div class="border px-4 py-3" data-testid="quiz-answers-tile" style="background:var(--card);border-color:var(--border)">
                <p class="text-xs uppercase tracking-widest mb-1" style="font-family:'DM Mono',monospace;color:var(--muted)">Quiz answers</p>
                <p style="font-family:'Playfair Display',serif;font-size:1.6rem;color:var(--fg)">{{ m.totalQuizAnswers }}</p>
              </div>
              <div class="border px-4 py-3" data-testid="accuracy-tile" style="background:var(--card);border-color:var(--border)">
                <p class="text-xs uppercase tracking-widest mb-1" style="font-family:'DM Mono',monospace;color:var(--muted)">Accuracy</p>
                <p style="font-family:'Playfair Display',serif;font-size:1.6rem;color:var(--fg)">
                  {{ m.accuracyPercentage === null ? '—' : m.accuracyPercentage + '%' }}
                </p>
              </div>
            </div>

            <!-- Quiz-prompt banner -->
            @if (m.cardsDue > 0) {
              <button (click)="goToQuiz()" data-testid="quiz-prompt-banner"
                class="w-full border px-5 py-4 mb-4 flex items-center justify-between text-left"
                style="background:var(--fg);border-color:var(--fg)">
                <span style="font-family:'Lora',serif;font-size:15px;color:var(--bg)">
                  {{ m.cardsDue }} {{ m.cardsDue === 1 ? 'card is' : 'cards are' }} due for review
                </span>
                <span style="font-family:'DM Mono',monospace;font-size:12px;letter-spacing:0.06em;color:var(--bg)">
                  Start Quiz →
                </span>
              </button>
            }
          }

          <!-- Standing action banners -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <button (click)="goToTeach()" class="border px-4 py-4 text-left"
              style="background:var(--card);border-color:var(--border)">
              <span style="font-family:'Lora',serif;font-size:14.5px;color:var(--fg)">Teach mode</span>
            </button>
            <button (click)="goToTutorial()" class="border px-4 py-4 text-left"
              style="background:var(--card);border-color:var(--border)">
              <span style="font-family:'Lora',serif;font-size:14.5px;color:var(--fg)">Tutorial</span>
            </button>
            <button (click)="goToPalaces()" class="border px-4 py-4 text-left"
              style="background:var(--card);border-color:var(--border)">
              <span style="font-family:'Lora',serif;font-size:14.5px;color:var(--fg)">Memory palaces</span>
            </button>
          </div>

          <!-- Names & faces inventory -->
          <p class="text-xs uppercase tracking-widest mb-3" style="font-family:'DM Mono',monospace;color:var(--muted)">
            Names &amp; Faces
          </p>

          @if (contacts().length === 0) {
            <div class="border px-5 py-10 text-center" style="background:var(--card);border-color:var(--border)">
              <p style="font-family:'Lora',serif;color:var(--muted)">No one stored here yet.</p>
              <button (click)="goToAddPerson()" class="mt-3 text-xs uppercase tracking-widest"
                style="font-family:'DM Mono',monospace;color:var(--accent);background:none;border:none">
                Add the first person →
              </button>
            </div>
          } @else {
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              @for (contact of contacts(); track contact.id) {
                <div class="border flex flex-col items-center gap-2 px-3 py-4"
                  style="background:var(--card);border-color:var(--border)">
                  @if (contact.photoPath) {
                    <img [src]="contact.photoPath" [alt]="contact.name"
                      style="width:56px;height:56px;border-radius:50%;object-fit:cover" />
                  } @else {
                    <span class="flex items-center justify-center"
                      style="width:56px;height:56px;border-radius:50%;background:var(--bg);font-family:'Playfair Display',serif;font-size:18px;color:var(--fg)">
                      {{ initials(contact.name) }}
                    </span>
                  }
                  <span class="text-center" style="font-family:'Lora',serif;font-size:13px;color:var(--fg)">{{ contact.name }}</span>
                </div>
              }
              <button (click)="goToAddPerson()"
                class="border flex flex-col items-center justify-center gap-2 px-3 py-4"
                style="background:transparent;border-color:var(--border);border-style:dashed">
                <span style="font-size:22px;color:var(--muted)">+</span>
                <span class="text-center text-xs uppercase tracking-widest" style="font-family:'DM Mono',monospace;color:var(--muted)">Add person</span>
              </button>
            </div>
          }

        </div>
      </main>

    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private contactsService = inject(ContactsService);
  private sessionService = inject(SessionService);
  private router = inject(Router);

  readonly metrics  = signal<DashboardMetrics | null>(null);
  readonly contacts = signal<Contact[]>([]);

  ngOnInit() {
    this.dashboardService.getMetrics().subscribe({
      next: m => this.metrics.set(m),
      error: () => {},
    });
    this.contactsService.list().subscribe({
      next: contacts => this.contacts.set(contacts),
      error: () => {},
    });
  }

  goToQuiz() { this.router.navigate(['/quiz']); }
  goToTeach() { this.router.navigate(['/teach']); }
  goToTutorial() { this.router.navigate(['/tutorial']); }
  goToPalaces() { this.router.navigate(['/palaces']); }
  goToAddPerson() { this.router.navigate(['/persons/new']); }
  goToAdmin() { this.router.navigate(['/admin/users']); }
  goToMeetings() { this.router.navigate(['/meetings']); }

  switchProfile() {
    this.sessionService.switchProfile().subscribe({
      next: () => this.router.navigate(['/select-profile']),
      error: () => this.router.navigate(['/select-profile']),
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
