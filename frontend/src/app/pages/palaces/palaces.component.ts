import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Palace, PalacesService } from '../../services/palaces.service';

@Component({
  selector: 'app-palaces',
  standalone: true,
  styles: [`
    :host {
      --bg:     #f4ede0;
      --card:   #ede3d0;
      --fg:     #1e1710;
      --muted:  #6b5c45;
      --border: rgba(30,23,16,0.18);
      display: block;
    }
  `],
  template: `
    <div class="min-h-screen flex flex-col" style="background:var(--bg)">

      <header class="sticky top-0 z-20 border-b flex items-center gap-4 px-5"
        style="background:var(--card);border-color:var(--border);height:52px;min-height:52px">
        <button (click)="goBack()" aria-label="Go back"
          style="background:none;border:none;cursor:pointer;font-family:'DM Mono',monospace;font-size:18px;color:var(--fg);line-height:1;padding:8px 0;flex-shrink:0">
          ←
        </button>
        <p class="flex-1 truncate" style="font-family:'Playfair Display',serif;font-size:15px;color:var(--fg)">
          Memory Palaces
        </p>
      </header>

      <main class="flex-1 overflow-y-auto">
        <div class="max-w-2xl mx-auto px-5 pt-8 pb-16">

          @if (palaces().length === 0) {
            <p style="font-family:'Lora',serif;color:var(--muted)">No memory palaces yet.</p>
          } @else {
            <div class="space-y-3">
              @for (palace of palaces(); track palace.id) {
                <div class="border px-4 py-3 flex items-center justify-between"
                  style="background:var(--card);border-color:var(--border)">
                  <span style="font-family:'Lora',serif;font-size:15px;color:var(--fg)">{{ palace.name }}</span>
                  <span class="text-xs" style="font-family:'DM Mono',monospace;color:var(--muted)">
                    {{ palace.loci.length }} loci
                  </span>
                </div>
              }
            </div>
          }

        </div>
      </main>

    </div>
  `,
})
export class PalacesComponent implements OnInit {
  private palacesService = inject(PalacesService);
  private router = inject(Router);

  readonly palaces = signal<Palace[]>([]);

  ngOnInit() {
    this.palacesService.list().subscribe({
      next: palaces => this.palaces.set(palaces),
      error: () => {},
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
