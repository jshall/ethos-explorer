import { Component, OnInit } from '@angular/core';

import { ISource } from 'ethos-prep';
import { SelectorService } from 'src/app/services/selector.service';

// @ts-expect-error
import SwaggerUI from 'swagger-ui';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
})
export class ContentComponent implements OnInit {
  source?: ISource

  constructor(private selector: SelectorService) {
    selector.sourceFeed.forEach(item => {
      this.source = item
      if(item)
      SwaggerUI({
        dom_id: 'app-content',
        spec: item.api
      })
      else
        document.getElementsByTagName('app-content')[0].innerHTML = ''
    })
  }

  ngOnInit(): void {
  }

}
