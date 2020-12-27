import { Component, Input, OnInit } from '@angular/core';
import { Version } from 'src/app/models/Version';
import { SelectorService } from 'src/app/services/selector.service';

@Component({
  selector: 'app-version',
  templateUrl: './version.component.html',
})
export class VersionComponent implements OnInit {
  @Input() version: Version

  constructor(
    private selector: SelectorService
  ) { }

  ngOnInit() { }

  setVersion() {
    this.selector.setVersion(this.version)
  }
}
