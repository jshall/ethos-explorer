import { Component, OnInit } from '@angular/core';

import { EthosData, IDomain } from 'ethos';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
})
export class NavComponent implements OnInit {
  domains: IDomain[]

  constructor() { }

  ngOnInit(): void {
    this.domains = EthosData.domains
  }

}
