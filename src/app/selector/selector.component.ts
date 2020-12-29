import { Component, OnInit } from '@angular/core';

import { EthosData, System, Version } from 'src/ethos';
import { SelectorService } from '../selector.service';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
})
export class SelectorComponent implements OnInit {
  sysNames: string[]

  version?: Version
  sysName: string
  system?: System

  constructor(
    private selector: SelectorService
  ) {
    this.sysNames = EthosData.systems

    this.version = this.selector.version
    this.selector.versionFeed.forEach(item => {
      this.version = item
    })

    this.sysName = this.selector.systemName
    this.selector.systemNameFeed.forEach(item => {
      this.sysName = item
    })

    this.system = this.selector.system
    this.selector.systemFeed.forEach(item => {
      this.system = item
    })
  }

  ngOnInit(): void { }

  hasSystem(name: string) {
    return !this.version || !this.version.systems ||
      !this.version.systems[name]
  }

  setSysName(name: string) {
    this.selector.setSysName(name)
  }
}
