import { Component, OnInit } from '@angular/core';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit {

  constructor(private service: SearchService) { }

  ngOnInit(): void {
  }

  search(value: string) {
    this.service.search(value)
  }
}
