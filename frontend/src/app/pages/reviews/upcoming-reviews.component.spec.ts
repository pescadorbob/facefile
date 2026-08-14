import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { UpcomingReviewsComponent } from './upcoming-reviews.component';
import { DashboardService, UpcomingReviews } from '../../services/dashboard.service';

function contact(name: string) {
  return { id: `id-${name.toLowerCase()}`, name, photoPath: null };
}

function upcoming(overrides: Partial<UpcomingReviews> = {}): UpcomingReviews {
  return {
    horizonDays: 14,
    timeZone: 'UTC',
    today: '2026-08-13',
    days: [
      { date: '2026-08-13', count: 2, contacts: [contact('Ada'), contact('Priya')] },
      { date: '2026-08-16', count: 1, contacts: [contact('Sam')] },
    ],
    ...overrides,
  };
}

describe('UpcomingReviewsComponent', () => {
  let fixture: ComponentFixture<UpcomingReviewsComponent>;

  async function render(data: UpcomingReviews = upcoming()): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [UpcomingReviewsComponent],
      providers: [provideRouter([]), { provide: DashboardService, useValue: { getUpcoming: () => of(data) } }],
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingReviewsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => fixture?.destroy());

  function all(testId: string): HTMLElement[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll(`[data-testid="${testId}"]`));
  }

  function el(testId: string): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector(`[data-testid="${testId}"]`);
  }

  it('groups upcoming reviews by day', async () => {
    await render();

    expect(all('upcoming-day').map(day => day.getAttribute('data-date'))).toEqual(['2026-08-13', '2026-08-16']);
  });

  it('shows the count of contacts due on each day', async () => {
    await render();

    expect(all('upcoming-day-count')[0].textContent).toContain('2 contacts');
    expect(all('upcoming-day-count')[1].textContent).toContain('1 contact');
  });

  it('names the contacts due on each day', async () => {
    await render();

    expect(all('upcoming-day-names')[0].textContent).toContain('Ada');
    expect(all('upcoming-day-names')[0].textContent).toContain('Priya');
  });

  it('shows only days that have reviews', async () => {
    await render();

    // 14th and 15th fall between the two populated days and are absent entirely.
    const dates = all('upcoming-day').map(day => day.getAttribute('data-date'));
    expect(dates).not.toContain('2026-08-14');
    expect(dates).not.toContain('2026-08-15');
  });

  it('lists the specific contacts when a future date is tapped', async () => {
    await render();

    all('upcoming-day-header')[1].click();
    fixture.detectChanges();

    const rows = all('upcoming-contact-row');
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain('Sam');
  });

  it('says so when nothing is scheduled in the window', async () => {
    await render(upcoming({ days: [] }));

    expect(el('upcoming-empty')).not.toBeNull();
  });

  it('marks the current day as today', async () => {
    await render();

    expect(all('upcoming-day-header')[0].textContent).toContain('Today');
  });
});
