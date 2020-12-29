import { Component, OnInit } from '@angular/core';

import { EthosData, IDomain } from 'ethos';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
})
export class NavComponent implements OnInit {
  domains: IDomain[]

  constructor() {
    this.domains = EthosData.domains
  }

  ngOnInit(): void { }

}
