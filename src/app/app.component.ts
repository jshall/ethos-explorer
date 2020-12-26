import { Component } from '@angular/core';
import { EthosData } from './models/EthosData';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ethos-explorer';

  async ngOnInit(): Promise<void> {
    const ethos = globalThis.ethos = await EthosData
    console.log('Ethos data', ethos)
  }
}
