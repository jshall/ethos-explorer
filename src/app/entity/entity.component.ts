import { Component, ElementRef, HostBinding, Input, OnInit } from '@angular/core'

import { Entity } from 'src/ethos'
import { SelectorService } from '../selector.service';

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
})
export class EntityComponent implements OnInit {
  @Input() entity!: Entity
  @HostBinding('class.collapsed') collapsed = true;

  constructor(
    private selector: SelectorService,
    private eRef: ElementRef
  ) {
    this.selector.versionFeed.forEach(version => {
      let ele = this.eRef.nativeElement
      this.collapsed = version.entity !== this.entity
      if (!this.collapsed)
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
