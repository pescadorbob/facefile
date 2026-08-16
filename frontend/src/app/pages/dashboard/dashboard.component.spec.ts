import type { MockInstance } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { ContactsService } from '../../services/contacts.service';
import { DashboardMetrics, DashboardService } from '../../services/dashboard.service';
import { Notification, NotificationsService } from '../../services/notifications.service';
import { SessionService } from '../../services/session.service';

function metrics(overrides: Partial<DashboardMetrics> = {}): DashboardMetrics {
  return { peopleAdded: 3, cardsDue: 2, totalQuizAnswers: 0, accuracyPercentage: null, nextReviewAt: null, ...overrides };
}

function reminder(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'n1',
    channel: 'in-app',
    message: '3 contacts are due for review. Tap to start your session.',
    link: '/quiz?scope=due&start=1',
    dueCount: 3,
    sentAt: '2026-08-13T09:00:00.000Z',
    readAt: null,
    ...overrides,
  };
}

describe('DashboardComponent — due reviews and reminders', () => {
  let navigateSpy: MockInstance;
  let navigateByUrlSpy: MockInstance;
  let readCalls: string[];
  let metricsReads: number;
  let fixture: ComponentFixture<DashboardComponent>;

  async function render(options: { metrics?: DashboardMetrics; notifications?: Notification[] } = {}): Promise<void> {
    readCalls = [];
    metricsReads = 0;

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        {
          provide: DashboardService,
          useValue: {
            getMetrics: () => {
              metricsReads += 1;
              return of(options.metrics ?? metrics());
            },
          },
        },
        { provide: ContactsService, useValue: { list: () => of([]) } },
        {
          provide: NotificationsService,
          useValue: {
            list: () => of(options.notifications ?? []),
            markRead: (id: string) => {
              readCalls.push(id);
              return of(undefined);
            },
          },
        },
        { provide: SessionService, useValue: { switchProfile: () => of(undefined) } },
      ],
    }).compileComponents();

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    navigateByUrlSpy = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    // The dashboard polls on an interval; destroying stops it.
    fixture?.destroy();
  });

  function el(testId: string): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector(`[data-testid="${testId}"]`);
  }

  it('shows the due count prominently', async () => {
    await render({ metrics: metrics({ cardsDue: 5 }) });

    expect(el('due-review-tile')?.textContent).toContain('5');
  });

  it('launches a due-only review session when the count is tapped', async () => {
    await render({ metrics: metrics({ cardsDue: 5 }) });

    el('due-review-tile')!.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/quiz'], { queryParams: { scope: 'due', start: 1 } });
  });

  it('launches a practice-all session when the count is tapped with nothing due', async () => {
    await render({ metrics: metrics({ cardsDue: 0 }) });

    el('due-review-tile')!.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/quiz'], { queryParams: { scope: 'all', start: 1 } });
  });

  it('says the user is caught up when nothing is due', async () => {
    await render({ metrics: metrics({ cardsDue: 0 }) });

    expect(el('caught-up-message')?.textContent).toContain("You're caught up!");
  });

  it('shows the next due date alongside the caught-up message', async () => {
    await render({ metrics: metrics({ cardsDue: 0, nextReviewAt: '2026-08-20T09:00:00.000Z' }) });

    expect(el('next-due-date')).not.toBeNull();
  });

  it('shows no caught-up message while cards are still due', async () => {
    await render({ metrics: metrics({ cardsDue: 2 }) });

    expect(el('caught-up-message')).toBeNull();
  });

  it('re-reads the metrics on a timer so newly due cards appear', async () => {
    vi.useFakeTimers();
    try {
      await render();
      const before = metricsReads;

      vi.advanceTimersByTime(15_000);

      expect(metricsReads).toBeGreaterThan(before);
    } finally {
      vi.useRealTimers();
    }
  });

  it('surfaces a delivered review reminder', async () => {
    await render({ notifications: [reminder()] });

    expect(el('review-reminder')?.textContent).toContain('3 contacts are due for review');
  });

  it('follows the reminder into a review session and marks it read', async () => {
    await render({ notifications: [reminder()] });

    el('review-reminder')!.click();
    fixture.detectChanges();

    expect(readCalls).toEqual(['n1']);
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/quiz?scope=due&start=1');
  });

  it('does not surface a reminder the user has already read', async () => {
    await render({ notifications: [reminder({ readAt: '2026-08-13T10:00:00.000Z' })] });

    expect(el('review-reminder')).toBeNull();
  });

  it('offers a way through to the upcoming reviews and reminder settings', async () => {
    await render();

    el('upcoming-link')!.click();
    expect(navigateSpy).toHaveBeenCalledWith(['/reviews/upcoming']);

    el('reminders-link')!.click();
    expect(navigateSpy).toHaveBeenCalledWith(['/settings/notifications']);
  });
});
