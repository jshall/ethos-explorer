import { Injectable } from '@angular/core';

import { EthosData, System, Version } from 'src/ethos';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectorService {
  private systemNameSource = new Subject<string>()
  private infoSource = new Subject<string>()
  private versionSource = new Subject<Version>()
  private systemSource = new Subject<System>()

  systemName = 'Colleague'
  systemNameFeed = this.systemNameSource.asObservable()

  info = 'API'
  infoFeed = this.infoSource.asObservable()

  version?: Version
  versionFeed = this.versionSource.asObservable()

  system?: System
  systemFeed = this.systemSource.asObservable()

  constructor() {
    addEventListener('hashchange', this.followHash.bind(this))
    this.followHash()
  }

  setSysName(name: string) {
    this.systemNameSource.next(this.systemName = name)
    this.setSystem(this.version?.systems[name])
  }

  setInfo(name: string) {
    this.infoSource.next(this.info = name)
  }

  setVersion(version: Version | undefined) {
    if (this.version === version)
      return
    this.versionSource.next(this.version = version)
    this.setSystem(version?.systems[this.systemName])
    this.updateUrl()
  }

  setSystem(system: System | undefined) {
    if (this.system === system)
      return
    this.systemSource.next(this.system = system)
    this.updateUrl()
  }

  followHash(event?: Event) {
    let [hash, r, v] = location.hash.split('/')
    if (hash) {
      let entity = EthosData.entities[r]
      entity?.getVersions().then(versions => {
        let version = versions.find(ver => ver.name === v) || versions.slice(-1)[0]
        if (event) this.replaceState = true
        this.setVersion(version);
      })
    }
  }

  private replaceState = false
  updateUrl() {
    let res = this.version?.entity.resource
    let ver = this.version?.name
    if (ver) {
      let url = `#/${res}/${ver}`
      if (location.hash !== url) {
        console.log('New url', url)
        if (this.replaceState)
          history.replaceState({}, '', url)
        else
          history.pushState({}, '', url)
      }
      document.title = `${res} v${ver} - Ethos Explorer`
    } else {
      document.title = 'Ethos Explorer'
    }
    this.replaceState = false
  }
}
