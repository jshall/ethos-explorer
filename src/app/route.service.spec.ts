import { TestBed } from '@angular/core/testing';

import { RouteService } from './route.service';

describe('RouteService', () => {
  let route: RouteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    route = TestBed.inject(RouteService);
  });

  it('should be created', () => {
    expect(route).toBeTruthy();
  });
});
