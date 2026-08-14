import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NotificationSettingsComponent } from './notification-settings.component';
import { SettingsService, UserSettings } from '../../services/settings.service';

function settings(overrides: Partial<UserSettings> = {}): UserSettings {
  return {
    quizMode: 'mixed',
    quizAnswerFormat: 'choice',
    ratingExplainerSeen: false,
    remindersEnabled: true,
    reminderHour: 9,
    reminderMinute: 30,
    reminderTimezone: 'Europe/London',
    reminderChannels: ['in-app'],
    lastReminderSentOn: null,
    ...overrides,
  };
}

describe('NotificationSettingsComponent', () => {
  let updates: Partial<UserSettings>[];
  let stored: UserSettings;
  let fixture: ComponentFixture<NotificationSettingsComponent>;

  async function render(initial: UserSettings = settings()): Promise<void> {
    updates = [];
    stored = initial;

    await TestBed.configureTestingModule({
      imports: [NotificationSettingsComponent],
      providers: [
        provideRouter([]),
        {
          provide: SettingsService,
          useValue: {
            get: () => of(stored),
            // Mirrors the server's merge semantics, which is the behaviour under test:
            // a partial update must leave every field it does not mention alone.
            update: (changes: Partial<UserSettings>) => {
              updates.push(changes);
              stored = { ...stored, ...changes };
              return of(stored);
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationSettingsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => fixture?.destroy());

  function el(testId: string): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector(`[data-testid="${testId}"]`);
  }

  function toggle(): HTMLInputElement {
    return el('reminders-toggle') as HTMLInputElement;
  }

  function setChecked(input: HTMLInputElement, checked: boolean): void {
    input.checked = checked;
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  it('offers a time picker showing the configured hour and minute', async () => {
    await render(settings({ reminderHour: 7, reminderMinute: 5 }));

    expect((el('reminder-time') as HTMLInputElement).value).toBe('07:05');
  });

  it('saves a newly picked time', async () => {
    await render();

    const time = el('reminder-time') as HTMLInputElement;
    time.value = '18:45';
    time.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(updates.at(-1)).toMatchObject({ reminderHour: 18, reminderMinute: 45 });
  });

  it('stores the timezone the time was chosen in', async () => {
    await render();

    const time = el('reminder-time') as HTMLInputElement;
    time.value = '18:45';
    time.dispatchEvent(new Event('change'));

    expect(updates.at(-1)?.reminderTimezone).toBeTruthy();
  });

  it('shows the timezone reminders are scheduled against', async () => {
    await render(settings({ reminderTimezone: 'Europe/London' }));

    expect(el('reminder-timezone')?.textContent).toContain('Europe/London');
  });

  it('turns all reminders off with a single toggle', async () => {
    await render(settings({ remindersEnabled: true }));

    setChecked(toggle(), false);

    expect(updates.at(-1)).toEqual({ remindersEnabled: false });
  });

  it('keeps the configured time when reminders are turned off', async () => {
    await render(settings({ remindersEnabled: true, reminderHour: 7, reminderMinute: 5 }));

    setChecked(toggle(), false);

    // Only the flag was sent, so nothing on the server could have reset the schedule.
    expect(updates.at(-1)).not.toHaveProperty('reminderHour');
    expect((el('reminder-time') as HTMLInputElement).value).toBe('07:05');
  });

  it('restores delivery at the previous time when reminders are turned back on', async () => {
    await render(settings({ remindersEnabled: true, reminderHour: 7, reminderMinute: 5 }));

    setChecked(toggle(), false);
    setChecked(toggle(), true);

    expect(stored.remindersEnabled).toBe(true);
    expect(stored.reminderHour).toBe(7);
    expect(stored.reminderMinute).toBe(5);
  });

  it('lets a delivery channel be turned off entirely', async () => {
    await render(settings({ reminderChannels: ['in-app'] }));

    setChecked(el('channel-in-app') as HTMLInputElement, false);

    expect(updates.at(-1)).toEqual({ reminderChannels: [] });
  });

  it('lets a delivery channel be turned back on', async () => {
    await render(settings({ reminderChannels: [] }));

    setChecked(el('channel-in-app') as HTMLInputElement, true);

    expect(updates.at(-1)).toEqual({ reminderChannels: ['in-app'] });
  });
});
