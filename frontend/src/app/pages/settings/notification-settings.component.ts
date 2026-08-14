import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService, UserSettings } from '../../services/settings.service';

/**
 * Notification settings (E-4.7). Every control here writes a partial update, so the
 * toggle can be flipped without disturbing the configured time — which is what makes
 * re-enabling restore the previous schedule rather than a default one (S-4.7.3).
 */
@Component({
  selector: 'app-notification-settings',
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
    input[type=time], select {
      border: 1px solid var(--border);
      padding: 10px 12px;
      font-family: 'DM Mono', monospace;
      font-size: 14px;
      background: var(--bg);
      color: var(--fg);
      border-radius: 0;
    }
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
          Review reminders
        </p>
      </header>

      <main class="flex-1 overflow-y-auto">
        <div class="max-w-2xl mx-auto px-5 pt-6 pb-16 space-y-6">

          @if (settings(); as current) {

            <div class="border px-4 py-4 flex items-center justify-between gap-4"
              style="background:var(--card);border-color:var(--border)">
              <div>
                <label for="reminders-toggle" style="font-family:'Lora',serif;font-size:15px;color:var(--fg)">
                  Review reminders
                </label>
                <p class="mt-1" style="font-family:'Lora',serif;font-size:13px;color:var(--muted)">
                  Turning these off never touches your review schedule.
                </p>
              </div>
              <input id="reminders-toggle" type="checkbox" data-testid="reminders-toggle"
                [checked]="current.remindersEnabled"
                (change)="setEnabled($any($event.target).checked)"
                style="width:22px;height:22px;flex-shrink:0" />
            </div>

            <div>
              <p class="text-xs uppercase tracking-widest mb-2"
                style="font-family:'DM Mono',monospace;color:var(--muted)">Time of day</p>
              <div class="flex items-center gap-3 flex-wrap">
                <input type="time" data-testid="reminder-time" aria-label="Reminder time"
                  [value]="timeValue(current)" (change)="setTime($any($event.target).value)" />
                <span class="text-xs" data-testid="reminder-timezone"
                  style="font-family:'DM Mono',monospace;color:var(--muted)">{{ current.reminderTimezone }}</span>
              </div>
              <p class="mt-2" style="font-family:'Lora',serif;font-size:13px;color:var(--muted)">
                Reminders arrive at this time in your own timezone, starting with the next one due.
              </p>
            </div>

            <div>
              <p class="text-xs uppercase tracking-widest mb-2"
                style="font-family:'DM Mono',monospace;color:var(--muted)">Where they arrive</p>
              <label class="flex items-center gap-3 border px-4 py-3"
                style="background:var(--card);border-color:var(--border)">
                <input type="checkbox" data-testid="channel-in-app"
                  [checked]="current.reminderChannels.includes('in-app')"
                  (change)="setChannel('in-app', $any($event.target).checked)"
                  style="width:18px;height:18px" />
                <span style="font-family:'Lora',serif;font-size:14.5px;color:var(--fg)">In the app</span>
              </label>
              <p class="mt-2" style="font-family:'Lora',serif;font-size:13px;color:var(--muted)">
                With nothing selected here, reminders are simply skipped — nothing breaks.
              </p>
            </div>

            @if (saveCount() > 0) {
              <!-- The count, not just the presence, is what says *which* save landed. -->
              <p data-testid="settings-saved" [attr.data-save-count]="saveCount()"
                class="text-xs uppercase tracking-widest"
                style="font-family:'DM Mono',monospace;color:var(--accent)">Saved</p>
            }

          } @else {
            <p style="font-family:'Lora',serif;color:var(--muted)">Loading your settings…</p>
          }

        </div>
      </main>

    </div>
  `,
})
export class NotificationSettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private router = inject(Router);

  readonly settings = signal<UserSettings | null>(null);
  /** Increments per successful save, so a second save is distinguishable from the first. */
  readonly saveCount = signal(0);

  ngOnInit() {
    this.settingsService.get().subscribe({
      next: settings => this.settings.set(settings),
      error: () => {},
    });
  }

  setEnabled(enabled: boolean) {
    // Only the flag is sent: hour, minute and timezone stay as they are (S-4.7.3).
    this.save({ remindersEnabled: enabled });
  }

  setTime(value: string) {
    const [hour, minute] = value.split(':').map(Number);
    if (!Number.isInteger(hour) || !Number.isInteger(minute)) return;
    this.save({ reminderHour: hour, reminderMinute: minute, reminderTimezone: browserTimezone() });
  }

  setChannel(channel: string, enabled: boolean) {
    const current = this.settings()?.reminderChannels ?? [];
    const next = enabled ? [...new Set([...current, channel])] : current.filter(c => c !== channel);
    this.save({ reminderChannels: next });
  }

  /**
   * Applies the change locally before the request goes out. The checkbox bindings are
   * one-way, so without this a change-detection pass while the request is in flight
   * snaps the control back to the stored value and the toggle visibly bounces. On
   * failure the previous state is restored, so the control never claims a save that
   * did not happen.
   */
  private save(changes: Partial<UserSettings>) {
    const previous = this.settings();
    this.settings.update(current => (current ? { ...current, ...changes } : current));

    this.settingsService.update(changes).subscribe({
      next: settings => {
        this.settings.set(settings);
        this.saveCount.update(count => count + 1);
      },
      error: () => this.settings.set(previous),
    });
  }

  timeValue(settings: UserSettings): string {
    return `${pad(settings.reminderHour)}:${pad(settings.reminderMinute)}`;
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** The reminder time is a wall-clock time, so it is stored with the zone it was chosen in. */
function browserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}
