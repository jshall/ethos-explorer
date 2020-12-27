import { Component, OnInit } from '@angular/core';

import { EthosData, ISource, IVersion } from 'ethos';
import { SelectorService } from 'src/app/services/selector.service';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
})
export class SelectorComponent implements OnInit {
  sources: string[]

  version?: IVersion
  sourceName: string
  source?: ISource

  constructor(
    private selector: SelectorService
  ) {
    this.version = this.selector.version
    this.selector.versionFeed.forEach(item => {
      this.version = item
    })

    this.sourceName = this.selector.sourceName
    this.selector.sourceNameFeed.forEach(item => {
      this.sourceName = item
    })

    this.source = this.selector.source
    this.selector.sourceFeed.forEach(item => {
      this.source = item
    })
  }

  ngOnInit(): void {
    this.sources = EthosData.sources
  }

  hasSource(name: string) {
    return !this.version || !this.version.sources ||
      !this.version.sources[name]
  }

  setSourceName(name: string) {
    this.selector.setSourceName(name)
  }
}
