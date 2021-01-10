import { Component, Input } from '@angular/core';

import { Version } from 'src/ethos';
import { RouteService } from '../route.service';

@Component({
  selector: 'app-version',
  templateUrl: './version.component.html',
})
export class VersionComponent {
  @Input() version!: Version

  set routeVersion(value: Version) { this.route.version = value }

  constructor(private route: RouteService) { }

}
