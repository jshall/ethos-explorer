import { Component } from '@angular/core';
import { Grammar, Parser } from 'nearley';
import { SearchService } from '../search.service';
import grammar from './search.grammar';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
})
export class SearchComponent {

  constructor(private service: SearchService) { }

  search(event: any) {
    let target = event.target as HTMLInputElement
    let value = target.value as string
    if (!value)
      return this.reset()
    let parser = new Parser(Grammar.fromCompiled(grammar))
    try {
      parser.feed(value)
      if (parser.results.length != 1)
        throw new Error('Ambiguous or incomplete result.')
      target.style.backgroundColor = ''
      this.service.search(parser.results[0])      
    } catch (error) {
      console.warn(error)
      target.style.backgroundColor = 'salmon'
    }
  }

  reset() {
    this.service.reset()
  }
}
