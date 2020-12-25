import { Component } from '@angular/core';
import { Ethos } from './ethos';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ethos-explorer';

  ngOnInit(): void {
    Ethos.then(ethos => {
      window.ethos = ethos.default
      console.log('Ethos data', window.ethos)
    })
  }
}
