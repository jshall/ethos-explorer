import { Component, HostBinding, Input, OnInit } from '@angular/core';

import { Domain } from 'src/ethos';
import { SelectorService } from '../selector.service';

@Component({
  selector: 'app-domain',
  templateUrl: './domain.component.html',
})
export class DomainComponent implements OnInit {
  @Input() domain!: Domain
  @HostBinding('class.collapsed') collapsed = true;

  constructor(private selector: SelectorService) {
    this.selector.versionFeed.forEach(version => {
      this.collapsed = !this.domain.contains(version)
    })
  }

  ngOnInit() { }

  toggle() {
    this.collapsed = !this.collapsed
  }

}
