import { Injectable } from '@angular/core';

import { EthosData, System, Version } from 'src/ethos';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private _systemName = 'Colleague'
  private readonly systemNameSource = new Subject<string>()
  readonly systemNameFeed = this.systemNameSource.asObservable()
  get systemName() { return this._systemName }
  set systemName(name: string) {
    if (this._systemName === name) return
    this.systemNameSource.next(this._systemName = name)
    this.system = this._version?.systems[name]
  }

  private _version?: Version
  private readonly versionSource = new Subject<Version>()
  readonly versionFeed = this.versionSource.asObservable()
  get version() { return this._version }
  set version(version: Version | undefined) {
    if (this._version === version) return
    this.versionSource.next(this._version = version)
    this.system = version?.systems[this._systemName]
    this.updateUrl()
  }

  private _system?: System
  private readonly systemSource = new Subject<System>()
  readonly systemFeed = this.systemSource.asObservable()
  get system() { return this._system }
  set system(system: System | undefined) {
    if (this._system === system) return
    this.systemSource.next(this._system = system)
    this.updateUrl()
  }

  constructor() {
    addEventListener('hashchange', this.followHash.bind(this))
    this.followHash()
  }

  private followHash(event?: Event) {
    let [hash, r, v] = location.hash.split('/')
    if (hash) {
      let entity = EthosData.entities[r]
      entity?.getVersions().then(versions => {
        let version = versions.find(ver => ver.name === v) || versions.slice(-1)[0]
        if (event) this.replaceState = true
        this.version = version;
      })
    }
  }

  private replaceState = false
  private updateUrl() {
    let res = this._version?.entity.resource
    let ver = this._version?.name
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
