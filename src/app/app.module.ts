import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './components/app.component';
import { NavComponent } from './components/nav/nav.component';
import { DomainComponent } from './components/nav/domain/domain.component';
import { ResourceComponent } from './components/nav/resource/resource.component';
import { VersionComponent } from './components/nav/version/version.component';
import { SelectorComponent } from './components/selector/selector.component';
import { ContentComponent } from './components/content/content.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    DomainComponent,
    ResourceComponent,
    VersionComponent,
    SelectorComponent,
    ContentComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
