import { Component, OnInit } from '@angular/core';

import { EthosData, Domain } from 'src/ethos';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
})
export class NavComponent implements OnInit {
  domains: Domain[]

  constructor() {
    this.domains = EthosData.domains
  }

  ngOnInit(): void { }

}
