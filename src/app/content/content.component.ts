import { Component, OnInit } from '@angular/core';

import { RouteService } from '../route.service';

// @ts-expect-error
import SwaggerUI from 'swagger-ui';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
})
export class ContentComponent implements OnInit {
  schema = ''

  constructor(private route: RouteService) {
    this.route.versionFeed.forEach(version => {
      if (version?.schema)
        this.schema = version.schema.toTypeScript()
      else
        this.schema = ''
    })

    this.route.systemFeed.forEach(system => {
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
