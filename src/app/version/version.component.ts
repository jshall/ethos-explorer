import { Component, Input, OnInit } from '@angular/core';

import { Version } from 'src/ethos';
import { RouteService } from '../route.service';

@Component({
  selector: 'app-version',
  templateUrl: './version.component.html',
})
export class VersionComponent implements OnInit {
  @Input() version!: Version

  constructor(
    private route: RouteService
  ) { }

  ngOnInit() { }

  setVersion() {
    this.route.setVersion(this.version)
  }
}
