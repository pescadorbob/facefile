import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Contact, ContactsService } from '../../services/contacts.service';
import { DashboardMetrics, DashboardService } from '../../services/dashboard.service';
import { Notification, NotificationsService } from '../../services/notifications.service';
import { SessionService } from '../../services/session.service';

/**
 * How often the dashboard re-reads its metrics while the user is sitting on it, so a
 * card that falls due mid-visit shows up without a manual refresh (S-4.6.1).
 */
const METRICS_REFRESH_MS = 15_000;

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
        <button (click)="goToUpcoming()" data-testid="upcoming-link"
          style="background:none;border:none;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.04em;color:var(--muted)">
          Upcoming
        </button>
        <button (click)="goToReminders()" data-testid="reminders-link"
          style="background:none;border:none;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.04em;color:var(--muted)">
          Reminders
        </button>
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
              <!-- Tapping the count starts a session with the due cards pre-loaded (S-4.6.1). -->
              <button (click)="goToDueQuiz()" class="border px-4 py-3 text-left" data-testid="due-review-tile"
                [attr.data-highlighted]="m.cardsDue > 0"
                [style.background]="m.cardsDue > 0 ? 'var(--accent)' : 'var(--card)'"
                [style.border-color]="m.cardsDue > 0 ? 'var(--accent)' : 'var(--border)'">
                <p class="text-xs uppercase tracking-widest mb-1"
                  style="font-family:'DM Mono',monospace"
                  [style.color]="m.cardsDue > 0 ? 'var(--bg)' : 'var(--muted)'">Due for review</p>
                <p style="font-family:'Playfair Display',serif;font-size:1.6rem"
                  [style.color]="m.cardsDue > 0 ? 'var(--bg)' : 'var(--fg)'">{{ m.cardsDue }}</p>
                @if (m.cardsDue === 0) {
                  <p data-testid="caught-up-message" class="mt-1"
                    style="font-family:'Lora',serif;font-size:12px;line-height:1.4;color:var(--muted)">
                    You're caught up!
                    @if (m.nextReviewAt) {
                      <span data-testid="next-due-date"> Next on {{ formatDate(m.nextReviewAt) }}.</span>
                    }
                  </p>
                }
              </button>
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

            <!-- Delivered reminders (E-4.7). The in-app channel surfaces here. -->
            @for (notification of unreadNotifications(); track notification.id) {
              <button (click)="openNotification(notification)" data-testid="review-reminder"
                class="w-full border px-5 py-3 mb-3 flex items-center justify-between gap-3 text-left"
                style="background:var(--card);border-color:var(--accent)">
                <span style="font-family:'Lora',serif;font-size:14.5px;color:var(--fg)">{{ notification.message }}</span>
                <span class="shrink-0" style="font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.06em;color:var(--accent)">
                  Review →
                </span>
              </button>
            }

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
                <button (click)="goToEditPerson(contact.id)" data-testid="contact-card"
                  [attr.aria-label]="'Edit ' + contact.name"
                  class="border flex flex-col items-center gap-2 px-3 py-4 text-left"
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
                </button>
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
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private contactsService = inject(ContactsService);
  private notificationsService = inject(NotificationsService);
  private sessionService = inject(SessionService);
  private router = inject(Router);

  readonly metrics  = signal<DashboardMetrics | null>(null);
  readonly contacts = signal<Contact[]>([]);
  readonly unreadNotifications = signal<Notification[]>([]);

  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.refreshMetrics();
    this.refreshNotifications();
    this.contactsService.list().subscribe({
      next: contacts => this.contacts.set(contacts),
      error: () => {},
    });
    // Cards fall due on a clock, not on a navigation — a dashboard left open has to
    // notice on its own (S-4.6.1).
    this.refreshTimer = setInterval(() => {
      this.refreshMetrics();
      this.refreshNotifications();
    }, METRICS_REFRESH_MS);
  }

  ngOnDestroy() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }

  private refreshMetrics() {
    this.dashboardService.getMetrics().subscribe({
      next: m => this.metrics.set(m),
      error: () => {},
    });
  }

  private refreshNotifications() {
    this.notificationsService.list().subscribe({
      next: notifications => this.unreadNotifications.set(notifications.filter(n => n.readAt === null)),
      error: () => {},
    });
  }

  /** Dismisses the reminder and follows it, which is where it said it would go. */
  openNotification(notification: Notification) {
    this.notificationsService.markRead(notification.id).subscribe({ next: () => {}, error: () => {} });
    this.unreadNotifications.update(list => list.filter(n => n.id !== notification.id));
    this.router.navigateByUrl(notification.link);
  }

  goToQuiz() { this.router.navigate(['/quiz']); }

  /**
   * Nothing due doesn't mean nothing to quiz — with no due cards, "due" scope would
   * hand the quiz page an empty session and dead-end on its empty state, so fall
   * back to practicing everything instead (S-2.4.4).
   */
  goToDueQuiz() {
    const scope = (this.metrics()?.cardsDue ?? 0) > 0 ? 'due' : 'all';
    this.router.navigate(['/quiz'], { queryParams: { scope, start: 1 } });
  }
  goToUpcoming() { this.router.navigate(['/reviews/upcoming']); }
  goToReminders() { this.router.navigate(['/settings/notifications']); }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  goToTeach() { this.router.navigate(['/teach']); }
  goToTutorial() { this.router.navigate(['/tutorial']); }
  goToPalaces() { this.router.navigate(['/palaces']); }
  goToAddPerson() { this.router.navigate(['/persons/new']); }
  goToEditPerson(id: string) { this.router.navigate(['/persons', id, 'edit']); }
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
