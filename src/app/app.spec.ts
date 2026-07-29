import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app with a skip link', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const skipLink = (fixture.nativeElement as HTMLElement).querySelector('.skip-link');
    expect(skipLink?.getAttribute('href')).toBe('#main');
  });
});
