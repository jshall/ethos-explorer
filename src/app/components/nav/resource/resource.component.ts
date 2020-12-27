import { Component, HostBinding, Input, OnInit } from '@angular/core'
import { IResource, IVersion } from 'ethos'
import { sortVersions } from 'src/app/models/Version';
import { SelectorService } from 'src/app/services/selector.service';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
})
export class ResourceComponent implements OnInit {
  @Input() resource: IResource
  @HostBinding('class.collapsed') collapsed = true;

  versions: IVersion[]

  constructor(private selector: SelectorService) {
    this.selector.versionFeed.forEach(version => {
      let found = this.resource.contains(version)
      this.collapsed = !found
    })
  }

  async ngOnInit(): Promise<void> {
    await this.resource.getVersions()
    this.versions = this.resource.versions.sort(sortVersions)
  }

  toggle() {
    this.collapsed = !this.collapsed
  }

}
