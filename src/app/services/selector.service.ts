import { Injectable } from '@angular/core';
import { EthosData, ISource, IVersion } from 'ethos';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectorService {
  private sourceNameSource = new Subject<string>()
  private versionSource = new Subject<IVersion>()
  private sourceSource = new Subject<ISource>()

  sourceName = 'Colleague'
  sourceNameFeed = this.sourceNameSource.asObservable()

  version?: IVersion
  versionFeed = this.versionSource.asObservable()

  source?: ISource
  sourceFeed = this.sourceSource.asObservable()

  constructor() {
    addEventListener('hashchange', this.followHash.bind(this))
    this.followHash()
  }

  setSourceName(name: string) {
    this.sourceNameSource.next(this.sourceName = name)
    this.setSource(this.version?.sources[name])
  }

  setVersion(version: IVersion | undefined) {
    if (this.version === version)
      return
    this.versionSource.next(this.version = version)
    this.setSource(version?.sources[this.sourceName])
    this.updateUrl()
  }

  setSource(source: ISource | undefined) {
    if (this.source === source)
      return
    this.sourceSource.next(this.source = source)
    this.updateUrl()
  }

  followHash(event?: Event) {
    let [hash, r, v] = location.hash.split('/')
    if (hash) {
      let resource = EthosData.resources[r]
      resource?.getVersions().then(versions => {
        let version = versions.find(ver => ver.name === v) || versions.slice(-1)[0]
        this.setVersion(version);
      })
    }
  }

  updateUrl() {
    let res = this.version?.resource.resource
    let ver = this.version?.name
    if (ver) {
      let url = `#/${res}/${ver}`
      if (location.hash !== url) {
        console.log('New url', url)
        history.pushState({}, '', url)
      }
      document.title = `${res} v${ver} - Ethos Explorer`
    } else {
      document.title = 'Ethos Explorer'
    }
  }
}
