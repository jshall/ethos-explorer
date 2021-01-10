import { Component } from '@angular/core';

import { EthosData } from 'src/ethos';
import { RouteService } from '../route.service';

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
})
export class SystemComponent {
  readonly systemNames = EthosData.systems

  get systemName() { return this.route.systemName }
  set systemName(value) { this.route.systemName = value }

  constructor(private route: RouteService) { }

  isInvalid(systemName: string) {
    return !(this.route.version?.systems[systemName])
  }
}
