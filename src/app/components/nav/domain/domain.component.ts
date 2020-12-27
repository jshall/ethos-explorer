import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { IDomain, IResource } from 'ethos';
import { SelectorService } from 'src/app/services/selector.service';

@Component({
  selector: 'app-domain',
  templateUrl: './domain.component.html',
})
export class DomainComponent implements OnInit {
  @Input() domain: IDomain
  @HostBinding('class.collapsed') collapsed = true;

  constructor(private selector: SelectorService) {
    this.selector.versionFeed.forEach(version => {
      let found = this.domain.contains(version)
      this.collapsed = !found
    })
  }

  ngOnInit() { }

  toggle() {
    this.collapsed = !this.collapsed
  }

}
