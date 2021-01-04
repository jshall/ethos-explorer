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

  private childSearches(state: SearchState, children: Promise<SearchState>[]): Promise<SearchState> {
    let settled = 0
    let found = false
    return new Promise(resolve =>
      children.forEach(child => child
        .then(result => {
          if (state.merge(result)) {
            found = true
            resolve(state)
          }
        })
        .finally(() => {
          if (!found && ++settled === children.length)
            resolve(state)
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
      return state

    return await this.childSearches(state, children)
  }

  async searchEntity(state: SearchState): Promise<SearchState> {
    if (!(state.item instanceof Entity))
      throw new Error('State should represent a Entity')
    let entity = state.item
    if (!entity.versions)
      await entity.getVersions()
    let children = entity.versions!.map(version => this.searchVersion(state.token.newState(version)))

    if (state.test('title', entity.name))
      return state
    if (state.test('resource', entity.resource))
      return state

    return await this.childSearches(state, children)
  }

  async searchVersion(state: SearchState): Promise<SearchState> {
    if (!(state.item instanceof Version))
      throw new Error('State should represent a Version')
    let version = state.item
    if (state.test('version', version.name))
      return state
    if (Object.keys(version.systems).some(sys => state.test('system', sys)))
      return state

    return state
  }
}

type query = string | [string, ...query[]]
type state = boolean | [string, ...state[]]

class SearchState {
  private readonly state: state

  readonly token: SearchToken
  readonly item: object
  get success() { return this.reduce(this.state) }
  get active() { return this.token === currentToken }

  constructor(token: SearchToken, item: object) {
    this.token = token
    this.item = item
    this.state = this.newState(token.query)
  }

  private newState(query: query): state {
    if (typeof query === 'string')
      return false
    let [key, ...words] = query
    let state: [string, ...state[]] = [key]
    words.forEach(word => {
      if (typeof word === 'string')
        state.push(false)
      else
        state.push(this.newState(word))
    })
    return state
  }

  private reduce(state: state): boolean {
    if (typeof state === 'boolean')
      return state
    let [op, ...states] = state
    switch (op) {
      case '|': return states.reduce<boolean>((p, c) => p || this.reduce(c), false)
      case '&': return states.reduce<boolean>((p, c) => p && this.reduce(c), true)
      default: return this.reduce(states[0])
    }
  }

  test(id: string, value: string): boolean {
    // TODO: cycle query and update state
    return this.success
  }

  merge(result: SearchState) {
    // TODO: merge result state into this one
    return this.success
  }
}

export class SearchToken {
  readonly query: query

  constructor(query: query) {
    this.query = query
  }

  newState(item: object) { return new SearchState(this, item) }
}