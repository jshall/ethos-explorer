import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Domain, Entity, EthosData, Version } from 'src/ethos';

let currentToken: SearchToken
const resultSource = new Subject<SearchState>()

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly resetSource = new Subject<void>()

  readonly resultFeed = resultSource.asObservable()
  readonly resetFeed = this.resetSource.asObservable()

  constructor() { }

  search(query: query): void {
    if (!query)
      return this.reset()
    let token = new SearchToken(query)
    currentToken = token
    setTimeout(() => {
      EthosData.domains.map(domain => this.searchDomain(token.newState(domain)))
    }, 0)
  }

  reset() { this.resetSource.next() }

  private childSearches(state: SearchState, children: Promise<SearchState>[]): Promise<void> {
    let settled = 0
    let found = false
    return new Promise(resolve =>
      children.forEach(child => child
        .then(result => {
          if (!found && state.merge(result)) {
            found = true
            resolve()
          }
        })
        .catch(error => console.error(error))
        .finally(() => {
          if (!found && ++settled === children.length)
            resolve()
        })
      )
    )
  }

  async searchDomain(state: SearchState): Promise<SearchState> {
    if (!(state.item instanceof Domain))
      throw new Error('State should represent a Domain')
    let domain = state.item
    let children: Promise<SearchState>[] = []
    domain.subdomains?.forEach(domain => children.push(this.searchDomain(state.token.newState(domain))))
    domain.entities?.forEach(entity => children.push(this.searchEntity(state.token.newState(entity))))

    if (state.test('title', domain.name))
      return state.markComplete()

    await this.childSearches(state, children)
    return state.markComplete()
  }

  async searchEntity(state: SearchState): Promise<SearchState> {
    if (!(state.item instanceof Entity))
      throw new Error('State should represent a Entity')
    let entity = state.item
    if (!entity.versions)
      await entity.getVersions()
    let children = entity.versions!.map(version => this.searchVersion(state.token.newState(version)))

    if (state.test('title', entity.name))
      return state.markComplete()
    if (state.test('resource', entity.resource))
      return state.markComplete()

    await this.childSearches(state, children)
    return state.markComplete()
  }

  async searchVersion(state: SearchState): Promise<SearchState> {
    if (!(state.item instanceof Version))
      throw new Error('State should represent a Version')
    let version = state.item
    if (state.test('version', version.name))
      return state.markComplete()
    if (Object.keys(version.systems).some(sys => state.test('system', sys)))
      return state.markComplete()

    return state.markComplete()
  }
}

type query = string | [string, ...query[]]

class StateData {
  operation: string
  items: Array<{ word: string, found: boolean } | StateData>

  constructor(query: query) {
    if (typeof query === 'string') {
      this.operation = '|'
      this.items = [{ word: query, found: false }]
    }
    else {
      let [op, ...words] = query
      this.operation = op
      this.items = []
      for (const word of words) {
        if (typeof word === 'string')
          this.items.push({ word, found: false })
        else
          this.items.push(new StateData(word))
      }
    }
  }

  toBoolean(): boolean {
    switch (this.operation) {
      case '|': return this.items.reduce<boolean>((p, c) => p || this.reduce(c), false)
      case '&': return this.items.reduce<boolean>((p, c) => p && this.reduce(c), true)
      default: return this.reduce(this.items[0])
    }
  }

  private reduce(item: { found: boolean } | StateData) {
    return item instanceof StateData ? item.toBoolean() : item.found
  }

  test(id: string, value: string) {
    if (['|', '&', id].includes(this.operation))
      for (const item of this.items) {
        if (item instanceof StateData)
          item.test(id, value)
        else
          item.found = item.found || !!value.toLowerCase().match(item.word.toLowerCase())
      }
  }

  merge(other: StateData) {
    for (const i in this.items) {
      const item = this.items[i]
      const src = other.items[i]
      if (item instanceof StateData)
        item.merge(src as typeof item)
      else
        item.found = item.found || (src as typeof item).found
    }
  }
}

class SearchState {
  private readonly state: StateData
  private completed = false

  readonly token: SearchToken
  readonly item: object
  get success() {
    if (!this.completed)
      throw new Error("Still searching");
    return this.state.toBoolean()
  }
  get active() { return this.token === currentToken }

  constructor(token: SearchToken, item: object) {
    this.token = token
    this.item = item
    this.state = new StateData(token.query)
  }

  test(id: string, value: string): boolean {
    if (this.completed)
      throw new Error("Search was marked as complete");
    this.state.test(id, value)
    return this.state.toBoolean()
  }

  markComplete(): SearchState {
    this.completed = true
    resultSource.next(this)
    return this
  }

  merge(other: SearchState): boolean {
    if (this.completed || !other.completed || other.token !== this.token)
      throw new Error('Incompatible states')
    this.state.merge(other.state)
    return this.state.toBoolean()
  }
}

export class SearchToken {
  readonly query: query

  constructor(query: query) {
    this.query = query
  }

  newState(item: object) { return new SearchState(this, item) }
}