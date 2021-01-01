import { Component, OnInit } from '@angular/core';

import { SelectorService } from '../selector.service';

// @ts-expect-error
import SwaggerUI from 'swagger-ui';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
})
export class ContentComponent implements OnInit {
  schema = ''

  constructor(private selector: SelectorService) {
    selector.versionFeed.forEach(version => {
      if (version?.schema)
        this.schema = version.schema.toTypeScript()
      else
        this.schema = ''
    })

    selector.systemFeed.forEach(system => {
      if (system)
        setTimeout(() => {
          SwaggerUI({
            dom_id: '#swagger',
            spec: system?.api
          })
        }, 20);
      else {
        let swagger;
        if (swagger = document.getElementById('swagger'))
          swagger.innerHTML = ''
      }
    })
  }

  ngOnInit(): void {
  }
}
