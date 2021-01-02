import { Component, OnInit } from '@angular/core';

import { EthosData, System, Version } from 'src/ethos';
import { RouteService } from '../route.service';

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
})
export class SystemComponent implements OnInit {
  sysNames: string[]
  infoTypes = ['Schema', 'API']

  sysName: string
  version?: Version
  system?: System

  constructor(
    private route: RouteService
  ) {
    this.sysNames = EthosData.systems

    this.version = this.route.version
    this.route.versionFeed.forEach(item => {
      this.version = item
    })

    this.sysName = this.route.systemName
    this.route.systemNameFeed.forEach(item => {
      this.sysName = item
    })

    this.system = this.route.system
    this.route.systemFeed.forEach(item => {
      this.system = item
    })
  }

  ngOnInit(): void { }

  hasSystem(name: string) {
    return !this.version || !this.version.systems ||
      !this.version.systems[name]
  }

  setSysName(name: string) {
    this.route.setSysName(name)
  }
}
