import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { AuthActions } from '../../../../core/auth/store/auth.actions';
import { initialAuthState } from '../../../../core/auth/store/auth.reducer';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let fixture: ComponentFixture<LoginPageComponent>;
  let element: HTMLElement;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [provideMockStore({ initialState: { auth: initialAuthState } })],
    });
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(LoginPageComponent);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  function type(selector: string, value: string): void {
    const input = element.querySelector<HTMLInputElement>(selector);
    if (!input) {
      throw new Error(`${selector} not found`);
    }
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
  }

  function submit(): void {
    element.querySelector('form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('shows validation messages instead of submitting an invalid form', () => {
    type('#email', 'nao-e-email');
    type('#password', '123');
    submit();

    expect(element.querySelector('#email-error')?.textContent).toContain('e-mail válido');
    expect(element.querySelector('#password-error')?.textContent).toContain('6 caracteres');
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('dispatches the login with a safe return url', () => {
    fixture.componentRef.setInput('returnUrl', '/boards/b1');
    type('#email', 'ana@fluxo.dev');
    type('#password', '123456');
    submit();

    expect(store.dispatch).toHaveBeenCalledWith(
      AuthActions.login({
        credentials: { email: 'ana@fluxo.dev', password: '123456' },
        returnUrl: '/boards/b1',
      }),
    );
  });

  it('ignores external return urls', () => {
    fixture.componentRef.setInput('returnUrl', '//evil.example.com');
    type('#email', 'ana@fluxo.dev');
    type('#password', '123456');
    submit();

    expect(store.dispatch).toHaveBeenCalledWith(
      AuthActions.login({
        credentials: { email: 'ana@fluxo.dev', password: '123456' },
        returnUrl: null,
      }),
    );
  });

  it('shows the API error from the store', () => {
    store.setState({ auth: { ...initialAuthState, error: 'Servidor indisponível.' } });
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Servidor indisponível.',
    );
  });
});
