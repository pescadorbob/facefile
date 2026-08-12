import type { MockInstance } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { SelectProfileComponent } from './select-profile.component';
import { AdminUser, AdminUsersService } from '../../services/admin-users.service';
import { SessionService, SessionUser } from '../../services/session.service';

function user(name: string, id = name.toLowerCase()): AdminUser {
  return { id, name, email: `${id}@example.com`, active: true, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' };
}

function profileCreated(name: string): SessionUser {
  return { id: 'new-id', name, active: true };
}

describe('SelectProfileComponent', () => {
  let createProfileCalls: Array<{ name: string; rememberMe: boolean }>;
  let createProfileResult: () => Observable<SessionUser>;
  let navigateSpy: MockInstance;

  async function renderWith(profiles: AdminUser[]): Promise<ComponentFixture<SelectProfileComponent>> {
    createProfileCalls = [];
    createProfileResult = () => of(profileCreated('Priya'));

    const adminUsersServiceStub = { listActive: () => of(profiles) };
    const sessionServiceStub = {
      select: () => of(profileCreated('Priya')),
      createProfile: (name: string, rememberMe: boolean) => {
        createProfileCalls.push({ name, rememberMe });
        return createProfileResult();
      },
    };

    await TestBed.configureTestingModule({
      imports: [SelectProfileComponent],
      providers: [
        provideRouter([]),
        { provide: AdminUsersService, useValue: adminUsersServiceStub },
        { provide: SessionService, useValue: sessionServiceStub },
      ],
    }).compileComponents();

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(SelectProfileComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  function text(fixture: ComponentFixture<SelectProfileComponent>): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  function nameInput(fixture: ComponentFixture<SelectProfileComponent>): HTMLInputElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('input[type=text]');
  }

  function buttonNamed(fixture: ComponentFixture<SelectProfileComponent>, label: string): HTMLButtonElement | undefined {
    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    return buttons.find(b => (b.textContent ?? '').trim().toLowerCase().includes(label.toLowerCase()));
  }

  async function settle(fixture: ComponentFixture<SelectProfileComponent>): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function typeName(fixture: ComponentFixture<SelectProfileComponent>, name: string): Promise<void> {
    const input = nameInput(fixture)!;
    input.value = name;
    input.dispatchEvent(new Event('input'));
    await settle(fixture);
  }

  async function clickCreate(fixture: ComponentFixture<SelectProfileComponent>): Promise<void> {
    buttonNamed(fixture, 'Create profile')!.click();
    await settle(fixture);
  }

  it('prompts the visitor to create a profile when none exist', async () => {
    const fixture = await renderWith([]);

    expect(text(fixture)).toContain('No profiles yet. Add a name to get started.');
    expect(nameInput(fixture)).not.toBeNull();
    // Nothing to go back to, so the prompt is the picker — no way to dismiss it.
    expect(buttonNamed(fixture, 'Cancel')).toBeUndefined();
  });

  it('offers a create action alongside the listed profiles', async () => {
    const fixture = await renderWith([user('Priya'), user('Sam')]);

    expect(text(fixture)).toContain('Priya');
    expect(text(fixture)).toContain('Sam');
    expect(buttonNamed(fixture, 'Create a profile')).toBeDefined();
    // The prompt stays closed until it is asked for.
    expect(nameInput(fixture)).toBeNull();
  });

  it('creates the profile and leaves the picker on success', async () => {
    const fixture = await renderWith([]);

    await typeName(fixture, '  Priya  ');
    await clickCreate(fixture);

    expect(createProfileCalls).toEqual([{ name: 'Priya', rememberMe: false }]);
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('rejects a blank name without creating anything', async () => {
    const fixture = await renderWith([]);

    await typeName(fixture, '   ');
    await clickCreate(fixture);

    expect(text(fixture)).toContain('A name is required.');
    expect(createProfileCalls).toEqual([]);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('surfaces a duplicate name as an inline error', async () => {
    const fixture = await renderWith([user('Priya')]);

    buttonNamed(fixture, 'Create a profile')!.click();
    await settle(fixture);

    createProfileResult = () => throwError(() => ({ status: 409, error: { error: 'name is already in use' } }));
    await typeName(fixture, 'Priya');
    await clickCreate(fixture);

    expect(text(fixture)).toContain('already in use');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('abandoning the prompt returns to the listed profiles', async () => {
    const fixture = await renderWith([user('Priya')]);

    buttonNamed(fixture, 'Create a profile')!.click();
    await settle(fixture);
    await typeName(fixture, 'Half-typed');

    buttonNamed(fixture, 'Cancel')!.click();
    await settle(fixture);

    expect(nameInput(fixture)).toBeNull();
    expect(text(fixture)).toContain('Priya');
    expect(createProfileCalls).toEqual([]);
  });
});
