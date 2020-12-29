import { Component, OnInit } from '@angular/core';

import { System } from 'src/ethos';
import { SelectorService } from '../selector.service';

// @ts-expect-error
import SwaggerUI from 'swagger-ui';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
})
export class ContentComponent implements OnInit {
  system?: System

  constructor(private selector: SelectorService) {
    selector.systemFeed.forEach(item => {
      this.system = item
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
