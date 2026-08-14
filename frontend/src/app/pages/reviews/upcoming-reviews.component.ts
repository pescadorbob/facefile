import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService, UpcomingDay, UpcomingReviews } from '../../services/dashboard.service';

/**
 * The Upcoming view (S-4.6.2). Days with nothing due never appear — the backend
 * returns only populated days, which is what keeps the list short enough to scan.
 */
@Component({
  selector: 'app-upcoming-reviews',
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

      <header class="sticky top-0 z-20 border-b flex items-center gap-4 px-5"
        style="background:var(--card);border-color:var(--border);height:52px;min-height:52px">
        <button (click)="goBack()" aria-label="Go back"
          style="background:none;border:none;font-family:'DM Mono',monospace;font-size:18px;color:var(--fg);line-height:1;flex-shrink:0">
          ←
        </button>
        <p class="flex-1 truncate" style="font-family:'Playfair Display',serif;font-size:15px;color:var(--fg)">
          Upcoming
        </p>
      </header>

      <main class="flex-1 overflow-y-auto">
        <div class="max-w-2xl mx-auto px-5 pt-6 pb-16">

          <p class="text-xs uppercase tracking-widest mb-4"
            style="font-family:'DM Mono',monospace;color:var(--muted)">
            Next {{ horizonDays() }} days
          </p>

          @if (loaded() && days().length === 0) {
            <div class="border px-5 py-10 text-center" data-testid="upcoming-empty"
              style="background:var(--card);border-color:var(--border)">
              <p style="font-family:'Lora',serif;color:var(--fg)">Nothing scheduled in the next {{ horizonDays() }} days.</p>
            </div>
          }

          <div class="space-y-3" data-testid="upcoming-list">
            @for (day of days(); track day.date) {
              <div class="border" data-testid="upcoming-day" [attr.data-date]="day.date"
                style="background:var(--card);border-color:var(--border)">

                <button (click)="toggle(day.date)" class="w-full flex items-center justify-between px-4 py-3 text-left"
                  data-testid="upcoming-day-header"
                  style="background:none;border:none">
                  <span style="font-family:'Lora',serif;font-size:15px;color:var(--fg)">
                    {{ dayLabel(day) }}
                  </span>
                  <span class="text-xs" data-testid="upcoming-day-count"
                    style="font-family:'DM Mono',monospace;letter-spacing:0.05em;color:var(--muted)">
                    {{ day.count }} {{ day.count === 1 ? 'contact' : 'contacts' }}
                    {{ expanded() === day.date ? '−' : '+' }}
                  </span>
                </button>

                <!--
                  Names are listed on every day, not only the expanded one: S-4.6.2 asks
                  for the count *and* the names per day. Expanding a day is the "tap a
                  future date" affordance and gives each contact its own row.
                -->
                @if (expanded() === day.date) {
                  <div class="border-t divide-y" style="border-color:var(--border)">
                    @for (contact of day.contacts; track contact.id) {
                      <div class="px-4 py-2 flex items-center gap-3" data-testid="upcoming-contact-row"
                        style="border-color:var(--border)">
                        @if (contact.photoPath) {
                          <img [src]="contact.photoPath" [alt]="contact.name"
                            style="width:28px;height:28px;border-radius:50%;object-fit:cover" />
                        }
                        <span style="font-family:'Lora',serif;font-size:14px;color:var(--fg)">{{ contact.name }}</span>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="px-4 pb-3" data-testid="upcoming-day-names">
                    <p style="font-family:'Lora',serif;font-size:13.5px;line-height:1.6;color:var(--muted)">
                      {{ names(day) }}
                    </p>
                  </div>
                }

              </div>
            }
          </div>

        </div>
      </main>

    </div>
  `,
})
export class UpcomingReviewsComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  readonly upcoming = signal<UpcomingReviews | null>(null);
  readonly loaded = signal(false);
  readonly expanded = signal<string | null>(null);

  readonly days = computed(() => this.upcoming()?.days ?? []);
  readonly horizonDays = computed(() => this.upcoming()?.horizonDays ?? 14);

  ngOnInit() {
    this.dashboardService.getUpcoming().subscribe({
      next: upcoming => {
        this.upcoming.set(upcoming);
        this.loaded.set(true);
      },
      error: () => this.loaded.set(true),
    });
  }

  toggle(date: string) {
    this.expanded.update(current => (current === date ? null : date));
  }

  names(day: UpcomingDay): string {
    return day.contacts.map(contact => contact.name).join(', ');
  }

  /** "Today" reads better than the date for the day the user is standing on. */
  dayLabel(day: UpcomingDay): string {
    if (day.date === this.upcoming()?.today) return `Today · ${this.formatDate(day.date)}`;
    return this.formatDate(day.date);
  }

  /** Parsed as a plain calendar date — the backend already resolved it into the user's timezone. */
  formatDate(date: string): string {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
