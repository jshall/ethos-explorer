import { Component, OnInit } from '@angular/core';

import { EthosData, System, Version } from 'src/ethos';
import { SelectorService } from '../selector.service';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
})
export class SelectorComponent implements OnInit {
  sysNames: string[]
  infoTypes = ['Schema', 'API']

  sysName: string
  info: string
  version?: Version
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

    this.info = this.selector.info
    this.selector.infoFeed.forEach(item => {
      this.info = item
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

  setInfo(name: string) {
    this.selector.setInfo(name)
  }
}
