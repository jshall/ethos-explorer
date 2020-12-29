import { Component, ElementRef, HostBinding, Input, OnInit } from '@angular/core'
import { IResource } from 'ethos'
import { SelectorService } from 'src/app/services/selector.service';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
})
export class ResourceComponent implements OnInit {
  @Input() resource!: IResource
  @HostBinding('class.collapsed') collapsed = true;

  constructor(
    private selector: SelectorService,
    private eRef: ElementRef
  ) {
    this.selector.versionFeed.forEach(version => {
      let ele = this.eRef.nativeElement
      this.collapsed = version.resource !== this.resource
      if (!this.collapsed)
        setTimeout(() => ele.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 20)
    })
  }

  async ngOnInit(): Promise<void> {
    await this.resource.getVersions()
  }

  toggle() {
    this.collapsed = !this.collapsed
  }

}
