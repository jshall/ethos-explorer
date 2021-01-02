import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { DomainComponent } from './domain/domain.component';
import { EntityComponent } from './entity/entity.component';
import { VersionComponent } from './version/version.component';
import { SystemComponent } from './system/system.component';
import { ContentComponent } from './content/content.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    DomainComponent,
    EntityComponent,
    VersionComponent,
    SystemComponent,
    ContentComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
