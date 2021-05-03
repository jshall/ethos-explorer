import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Domain, Entity, EthosData, Property, System, Version } from 'src/ethos';

let currentQuery: Query | undefined
const results = new Subject<SearchState>()

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly resetSource = new Subject<void>()

  readonly resultFeed = results.asObservable()
  readonly resetFeed = this.resetSource.asObservable()

  constructor() { }

  search(query: Query): void {
    if (!query)
      return this.reset()
    currentQuery = query
    setTimeout(() => {
      for (const domain of EthosData.domains)
        this.searchDomain(new SearchState(query, domain))
    }, 1)
  }

  reset() {
    currentQuery = undefined
    this.resetSource.next()
  }

  private childSearches(state: SearchState, children: Promise<SearchState>[], mergePartial = true): Promise<void> {
    let settled = 0
    let found = false
    if (!children.length)
      return Promise.resolve()
    return new Promise(resolve =>
      children.forEach(child => child
        .then(result => {
          if (!found && (mergePartial || result.success) && state.merge(result)) {
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
    domain.subdomains?.forEach(domain => children.push(this.searchDomain(state.new(domain))))
    domain.entities?.forEach(entity => children.push(this.searchEntity(state.new(entity))))

    if (state.test('title', domain.name))
      return state.markComplete()

    await this.childSearches(state, children, false)
    return state.markComplete()
  }

  async searchEntity(state: SearchState): Promise<SearchState> {
    if (!(state.item instanceof Entity))
      throw new Error('State should represent a Entity')
    let entity = state.item
    if (!entity.versions)
      await entity.getVersions()
    let children = entity.versions!.map(version => this.searchVersion(state.new(version)))

    if (state.test('title', entity.name))
      return state.markComplete()
    if (state.test('resource', entity.resource))
      return state.markComplete()

    await this.childSearches(state, children, false)
    return state.markComplete()
  }

  async searchVersion(state: SearchState): Promise<SearchState> {
    if (!(state.item instanceof Version))
      throw new Error('State should represent a Version')
    let version = state.item
    let children: Promise<SearchState>[] = []
    Object.values(version.systems).forEach(sys => children.push(this.searchSystem(state.new(sys))))
    // if (version.schema)
    //   children.push(this.searchSchema(state.new(version.schema)))

    if (state.test('version', version.name))
      return state.markComplete()
    if (Object.keys(version.systems).some(sys => state.test('system', sys)))
      return state.markComplete()

    await this.childSearches(state, children)
    return state.markComplete()
  }

  async searchSystem(state: SearchState): Promise<SearchState> {
    if (!(state.item instanceof System))
      throw new Error('State should represent a System')
    let system = state.item
    let children: Promise<SearchState>[] = []
    if (system.properties)
      Object.values(system.properties).forEach(prop => children.push(this.searchSystemProperties(state.new(prop))))
    // if (system.api)
    //   children.push(this.searchApi(state.new(system.api)))

    if (system.properties && Object.keys(system.properties).some(prop => state.test('property', prop)))
      return state.markComplete()

    await this.childSearches(state, children)
    return state.markComplete()
  }

  async searchSystemProperties(state: SearchState): Promise<SearchState> {
    let prop = state.item as Property

    if (prop.from) {
      if (state.test('object', prop.from.object))
        return state.markComplete()
      if (state.test('field', prop.from.field))
        return state.markComplete()
      if (state.test('notes', prop.from.notes))
        return state.markComplete()
    }

    if (prop.ref) {
      if (state.test('object', prop.ref.object))
        return state.markComplete()
      if (state.test('field', prop.ref.field))
        return state.markComplete()
    }

    if (prop.UI && state.test('ui', prop.UI))
      return state.markComplete()

    return state.markComplete()
  }
}

type Query = string | [string, ...Query[]]

class StateData {
  operation: string
  items: Array<{ word: string, found: boolean } | StateData>

  constructor(query: Query) {
    if (typeof query === 'string') {
      this.operation = '&'
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
  private readonly data: StateData
  private completed = false

  readonly query: Query
  readonly item: object
  get success() {
    if (!this.completed)
      throw new Error("Still searching")
    return this.data.toBoolean()
  }
  get active() { return this.query === currentQuery; }

  constructor(query: Query, item: object) {
    this.query = query
    this.item = item
    this.data = new StateData(query)
  }

  new(item: object) { return new SearchState(this.query, item) }

  test(id: string, value: string): boolean {
    if (this.completed)
      throw new Error("Search was marked as complete")
    this.data.test(id, value)
    return this.data.toBoolean()
  }

  markComplete(): SearchState {
    this.completed = true
    results.next(this)
    return this
  }

  merge(other: SearchState): boolean {
    if (this.completed || !other.completed || other.query !== this.query)
      throw new Error('Incompatible states')
    this.data.merge(other.data)
    return this.data.toBoolean()
  }
}
