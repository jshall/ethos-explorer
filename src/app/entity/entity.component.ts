import { Component, ElementRef, HostBinding, Input, OnInit } from '@angular/core'

import { Entity } from 'src/ethos'
import { RouteService } from '../route.service';

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
})
export class EntityComponent implements OnInit {
  @Input() entity!: Entity
  @HostBinding('class.collapsed') collapsed = true;

  constructor(
    private route: RouteService,
    private eRef: ElementRef
  ) {
    this.route.versionFeed.forEach(version => {
      let ele = this.eRef.nativeElement
      if (!(this.collapsed = !version.from(this.entity)))
        setTimeout(() => ele.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 20)
    })
  }

  async ngOnInit(): Promise<void> {
    await this.entity.getVersions()
  }

  toggle() {
    this.collapsed = !this.collapsed
  }

}
