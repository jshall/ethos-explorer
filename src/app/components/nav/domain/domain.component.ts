import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { IDomain, IResource } from 'ethos';

@Component({
  selector: 'app-domain',
  templateUrl: './domain.component.html',
})
export class DomainComponent implements OnInit {
  @Input() domain: IDomain
  @HostBinding('class.collapsed') collapsed = true;

  ngOnInit() { }

  toggle() {
    this.collapsed = !this.collapsed
  }

}
