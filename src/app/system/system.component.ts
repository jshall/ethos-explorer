import { Component, OnInit } from '@angular/core';

import { EthosData, System, Version } from 'src/ethos';
import { RouteService } from '../route.service';

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
})
export class SystemComponent implements OnInit {
  readonly systemNames = EthosData.systems

  get systemName() { return this.route.systemName }
  set systemName(value) { this.route.systemName = value }

  constructor(private route: RouteService) { }

  ngOnInit(): void { }

  isInvalid(systemName: string) {
    return !(this.route.version?.systems[systemName])
  }
}
