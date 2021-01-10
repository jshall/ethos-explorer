import { Component } from '@angular/core';

import { EthosData, Domain } from 'src/ethos';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
})
export class NavComponent {
  domains: Domain[]

  constructor() {
    this.domains = EthosData.domains
  }

}
