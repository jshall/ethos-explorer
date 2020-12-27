import { Injectable } from '@angular/core';
import { ISource } from 'ethos';
import { Subject } from 'rxjs';
import { Version } from '../models/Version';
import SwaggerUI from 'swagger-ui';

@Injectable({
  providedIn: 'root'
})
export class SelectorService {
  private versionSource = new Subject<Version>()
  private sourceSource = new Subject<string>()

  version?: Version
  versionFeed = this.versionSource.asObservable()

  source = 'Colleague'
  sourceFeed = this.sourceSource.asObservable()

  constructor() {
    this.versionFeed.forEach(item => this.version = item)
    this.sourceFeed.forEach(item => this.source = item)
  }

  setVersion(version: Version) {
    this.versionSource.next(version)
    this.loadSwagger()
  }

  setSource(source: string) {
    this.sourceSource.next(source)
    this.loadSwagger()
  }

  private loadSwagger() {
    let src: ISource
    if (this.version && this.source && (src = this.version.sources[this.source]) && src.api)
      SwaggerUI({
        dom_id: '#content',
        spec: src.api
      })
  }
}
