import { Component, HostBinding, Input } from '@angular/core';

import { Domain } from 'src/ethos';
import { RouteService } from '../route.service';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-domain',
  templateUrl: './domain.component.html',
})
export class DomainComponent {
  @Input() domain!: Domain
  @HostBinding('class.collapsed') collapsed = true
  @HostBinding('style.display') display?: string

  active = false

  constructor(
    private route: RouteService,
    private search: SearchService
  ) {
    this.route.versionFeed.forEach(version => {
      this.collapsed = !(this.active = version.from(this.domain))
    })
    this.search.resultFeed.forEach(result => {
      if (result.active && result.item === this.domain)
        if (result.success) {
          this.display = undefined
          this.collapsed = false
        } else
          this.display = 'none'
    })
    this.search.resetFeed.forEach(() => {
      this.display = undefined
      this.collapsed = !this.active
    })
  }

  toggle() {
    this.collapsed = !this.collapsed
  }

}
