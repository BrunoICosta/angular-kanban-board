import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideI18nTesting } from '../testing/i18n-testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideI18nTesting()],
    }).compileComponents();
  });

  it('should create the app with a skip link', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const skipLink = (fixture.nativeElement as HTMLElement).querySelector('.skip-link');
    expect(skipLink?.getAttribute('href')).toBe('#main');
  });
});
