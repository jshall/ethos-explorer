import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { IDomain } from 'ethos';
import { SelectorService } from 'src/app/services/selector.service';

@Component({
  selector: 'app-domain',
  templateUrl: './domain.component.html',
})
export class DomainComponent implements OnInit {
  @Input() domain!: IDomain
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
