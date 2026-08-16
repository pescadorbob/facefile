import type { MockInstance } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EditPersonComponent } from './edit-person.component';
import { Contact, ContactsService, UpdateContactPayload } from '../../services/contacts.service';

function contact(overrides: Partial<Contact> = {}): Contact {
  return { id: 'contact-1', name: 'Priya Chandra', photoPath: null, nameImage: null, associationScene: null, ...overrides };
}

describe('EditPersonComponent', () => {
  let navigateSpy: MockInstance;
  let updateCalls: UpdateContactPayload[];
  let fixture: ComponentFixture<EditPersonComponent>;

  async function render(options: { contact?: Contact; getError?: boolean; updateError?: string } = {}): Promise<void> {
    updateCalls = [];

    await TestBed.configureTestingModule({
      imports: [EditPersonComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'contact-1' }) } } },
        {
          provide: ContactsService,
          useValue: {
            get: () => (options.getError ? throwError(() => new Error('not found')) : of(options.contact ?? contact())),
            update: (_id: string, payload: UpdateContactPayload) => {
              updateCalls.push(payload);
              if (options.updateError) return throwError(() => ({ error: { error: options.updateError } }));
              return of(contact({ ...payload, photoPath: null }));
            },
          },
        },
      ],
    }).compileComponents();

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(EditPersonComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function el(testId: string): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector(`[data-testid="${testId}"]`);
  }

  function nameInput(): HTMLInputElement {
    return (fixture.nativeElement as HTMLElement).querySelector('input[aria-label="Name"]') as HTMLInputElement;
  }

  function setName(value: string) {
    const input = nameInput();
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function chooseFile(file: File) {
    const input = (fixture.nativeElement as HTMLElement).querySelector('input[type=file]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
  }

  function clickButton(name: string) {
    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    const match = buttons.find(b => b.textContent?.trim() === name);
    if (!match) throw new Error(`No button named "${name}"`);
    match.click();
  }

  afterEach(() => fixture?.destroy());

  it('pre-fills the form with the contact\'s current name and photo', async () => {
    await render({ contact: contact({ name: 'Priya Chandra', photoPath: 'https://photos.example/priya.jpg' }) });

    expect(nameInput().value).toBe('Priya Chandra');
    expect((fixture.nativeElement as HTMLElement).querySelector('img')?.getAttribute('src')).toBe('https://photos.example/priya.jpg');
  });

  it('shows a placeholder when the contact has no saved photo', async () => {
    await render({ contact: contact({ photoPath: null }) });

    expect(el('photo-placeholder')).not.toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('img')).toBeNull();
  });

  it('does not offer to remove a photo that does not exist', async () => {
    await render({ contact: contact({ photoPath: null }) });

    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    expect(buttons.some(b => b.textContent?.trim() === 'Remove photo')).toBe(false);
  });

  it('saves a changed name', async () => {
    await render({ contact: contact({ name: 'Jon Park' }) });

    setName('John Park');
    clickButton('Save changes');
    await fixture.whenStable();

    expect(updateCalls[0].name).toBe('John Park');
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('blocks the save and shows an inline error when the name is cleared', async () => {
    await render();

    setName('');
    clickButton('Save changes');
    await fixture.whenStable();

    expect(el('edit-person-name-error')).not.toBeNull();
    expect(updateCalls).toEqual([]);
  });

  it('rejects a photo over the 5 MB limit before ever uploading it', async () => {
    await render({ contact: contact({ photoPath: 'https://photos.example/priya.jpg' }) });

    const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'huge.png', { type: 'image/png' });
    chooseFile(oversized);
    fixture.detectChanges();

    expect(el('edit-person-form-error')?.textContent).toContain('5 MB');
    clickButton('Save changes');
    await fixture.whenStable();
    expect(updateCalls).toEqual([]);
  });

  it('rejects a non-image file before ever uploading it', async () => {
    await render({ contact: contact({ photoPath: 'https://photos.example/priya.jpg' }) });

    const notAnImage = new File(['not a photo'], 'notes.txt', { type: 'text/plain' });
    chooseFile(notAnImage);
    fixture.detectChanges();

    expect(el('edit-person-form-error')?.textContent).toContain('image');
    clickButton('Save changes');
    await fixture.whenStable();
    expect(updateCalls).toEqual([]);
  });

  it('cancels without saving', async () => {
    await render();

    setName('Something Else');
    clickButton('Cancel');

    expect(updateCalls).toEqual([]);
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });
});
