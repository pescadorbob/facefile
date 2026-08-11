import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminUsersComponent } from './admin-users.component';
import { AdminUsersService } from '../../../services/admin-users.service';

describe('AdminUsersComponent', () => {
  it('shows a friendly empty-state message when the profile has no user accounts', async () => {
    const adminUsersServiceStub = { list: () => of([]) };

    await TestBed.configureTestingModule({
      imports: [AdminUsersComponent],
      providers: [
        provideRouter([]),
        { provide: AdminUsersService, useValue: adminUsersServiceStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminUsersComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No user accounts yet.');
    expect(compiled.querySelector('table')).toBeNull();
  });
});
