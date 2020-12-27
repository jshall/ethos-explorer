import { Component, OnInit } from '@angular/core';
import { IDomain } from 'ethos';
import { EthosData } from '../../models/EthosData';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
})
export class NavComponent implements OnInit {
  domains: IDomain[]

  constructor() { }

  async ngOnInit(): Promise<void> {
    this.domains = (await EthosData).domains
  }

}
