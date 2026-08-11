import { Component } from '@angular/core';

@Component({
  selector: 'app-meetings',
  standalone: true,
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center px-5"
      style="background:#f4ede0">
      <p style="font-family:'DM Mono',monospace;font-size:14px;color:#6b5c45">
        Meetings coming soon
      </p>
    </div>
  `,
})
export class MeetingsComponent {}
