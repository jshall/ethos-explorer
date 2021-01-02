import { Component, HostBinding, Input, OnInit } from '@angular/core';

import { Domain } from 'src/ethos';
import { RouteService } from '../route.service';

@Component({
  selector: 'app-domain',
  templateUrl: './domain.component.html',
})
export class DomainComponent implements OnInit {
  @Input() domain!: Domain
  @HostBinding('class.collapsed') collapsed = true;

  constructor(private route: RouteService) {
    this.route.versionFeed.forEach(version => {
      this.collapsed = !version.from(this.domain)
    })
  }

  ngOnInit() { }

  toggle() {
    this.collapsed = !this.collapsed
  }

}
