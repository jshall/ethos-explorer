import { TestBed } from '@angular/core/testing';

import { SelectorService } from './selector.service';

describe('VersionService', () => {
  let selector: SelectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    selector = TestBed.inject(SelectorService);
  });

  it('should be created', () => {
    expect(selector).toBeTruthy();
  });
});
