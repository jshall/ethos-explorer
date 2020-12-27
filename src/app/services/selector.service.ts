import { Injectable } from '@angular/core';
import { ISource, IVersion } from 'ethos';
import { Subject } from 'rxjs';
import SwaggerUI from 'swagger-ui';

@Injectable({
  providedIn: 'root'
})
export class SelectorService {
  private versionSource = new Subject<IVersion>()
  private sourceNameSource = new Subject<string>()
  private sourceSource = new Subject<ISource>()

  version?: IVersion
  versionFeed = this.versionSource.asObservable()

  sourceName = 'Colleague'
  sourceNameFeed = this.sourceNameSource.asObservable()

  source?: ISource
  sourceFeed = this.sourceSource.asObservable()

  constructor() { }

  setVersion(version: IVersion) {
    this.versionSource.next(this.version = version)
    this.loadSwagger()
  }

  setSourceName(name: string) {
    this.sourceNameSource.next(this.sourceName = name)
    this.loadSwagger()
  }

  private loadSwagger() {
    if (!this.version || !this.sourceName || !(this.source = this.version.sources[this.sourceName]) || !this.source.api)
      document.getElementById('content')!.innerHTML = ''
    else
      SwaggerUI({
        dom_id: '#content',
        spec: this.source.api
      })
  }
}
