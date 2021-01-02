import { Component, ElementRef, HostBinding, Input, OnInit } from '@angular/core'

import { Entity } from 'src/ethos'
import { RouteService } from '../route.service';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
})
export class EntityComponent implements OnInit {
  @Input() entity!: Entity
  @HostBinding('class.collapsed') collapsed = true;
  @HostBinding('style.display') display?: string

  active = false

  constructor(
    private route: RouteService,
    private search: SearchService,
    private eRef: ElementRef
  ) {
    this.route.versionFeed.forEach(version => {
      this.collapsed = !(this.active = version.from(this.entity))
      if (this.active) {
        let ele = this.eRef.nativeElement
        setTimeout(() => ele.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 20)
      }
    })
    this.search.resultFeed.forEach(result => {
      if (result.active && result.item === this.entity)
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

  async ngOnInit(): Promise<void> {
    await this.entity.getVersions()
  }

  toggle() {
    this.collapsed = !this.collapsed
  }

}
