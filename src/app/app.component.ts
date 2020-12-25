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
      (window as any).ethos = ethos
      console.log('Ethos data', ethos)
    })
  }
}
