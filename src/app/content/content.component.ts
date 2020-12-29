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
  info: string
  system?: System

  constructor(private selector: SelectorService) {
    this.info = selector.info
    selector.infoFeed.forEach(item => {
      this.info = item
      this.updateContent()
    })
    selector.systemFeed.forEach(item => {
      this.system = item
      this.updateContent()
    })
  }

  ngOnInit(): void {
  }

  updateContent() {
    let swagger;
    if (this.system && this.info === 'API')
      setTimeout(() => {
        SwaggerUI({
          dom_id: '#swagger',
          spec: this.system?.api
        })
      }, 20);
    else if (swagger = document.getElementById('swagger'))
      swagger.innerHTML = ''
  }
}
