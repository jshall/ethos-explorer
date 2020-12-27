import { Component, HostBinding, HostListener, Input, OnInit } from '@angular/core'
import { IResource, IVersion } from 'ethos'
import { Version } from 'src/app/models/Version';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
})
export class ResourceComponent implements OnInit {
  @Input() resource: IResource
  @HostBinding('class.collapsed') collapsed = true;

  versions: Version[]

  constructor() { }

  async ngOnInit(): Promise<void> {
    await this.resource.getVersions()
    this.versions = Object
      .entries(this.resource.versions)
      .map(([name, data]) => ({ name, ...data }))
      .sort(sortVersions)
  }

  toggle() {
    this.collapsed = !this.collapsed
  }

}

function sortVersions(a: Version, b: Version): number {
  let [a1, a2, a3] = a.name.split('.').map(n => parseInt(n, 10))
  let [b1, b2, b3] = b.name.split('.').map(n => parseInt(n, 10))
  if (a1 - b1) return a1 - b1
  if (a2 - b2) return a2 - b2
  return a3 - b3
}
