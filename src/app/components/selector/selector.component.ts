import { Component, OnInit } from '@angular/core';

import { EthosData } from 'ethos';
import { Version } from 'src/app/models/Version';
import { SelectorService } from 'src/app/services/selector.service';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
})
export class SelectorComponent implements OnInit {
  sources: string[]

  version?: Version
  source: string

  constructor(
    private selector: SelectorService
  ) {
    this.version = this.selector.version
    this.selector.versionFeed.forEach(item => {
      this.version = item
    })

    this.source = this.selector.source
    this.selector.sourceFeed.forEach(item => {
      this.source = item
    })
  }

  ngOnInit(): void {
    this.sources = EthosData.sources
  }

  setSource(source: string) {
    this.selector.setSource(source)
  }
}
