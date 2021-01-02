import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Domain, Entity, EthosData, Version } from 'src/ethos';

let currentToken: SearchToken
const resultSource = new Subject<SearchResult>()

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly resetSource = new Subject<void>()

  readonly resultFeed = resultSource.asObservable()
  readonly resetFeed = this.resetSource.asObservable()

  constructor() { }

  search(query: string): void {
    if (!query) {
      this.resetSource.next()
      return
    }
    let token = new SearchToken(query)
    currentToken = token
    setTimeout(() => {
      EthosData.domains.map(domain => this.searchDomain(domain, token))
    }, 0)
  }

  private childSearches(token: SearchToken, item: object, children: Promise<SearchResult>[]): Promise<SearchResult> {
    let settled = 0
    let found = false
    return new Promise(resolve =>
      children.forEach(child => child
        .then(result => {
          if (result.success) {
            found = true
            resolve(new SearchResult(token, item))
          }
        })
        .finally(() => {
          if (!found && ++settled === children.length)
            resolve(new SearchResult(token, item, new Error('Not Found')))
        })
      )
    )
  }

  async searchDomain(domain: Domain, token: SearchToken): Promise<SearchResult> {
    let children: Promise<SearchResult>[] = []
    domain.subdomains?.forEach(domain => children.push(this.searchDomain(domain, token)))
    domain.entities?.forEach(entity => children.push(this.searchEntity(entity, token)))

    if (domain.name.toLowerCase().match(token.query.toLowerCase()))
      return new SearchResult(token, domain)

    return await this.childSearches(token, domain, children)
  }

  async searchEntity(entity: Entity, token: SearchToken): Promise<SearchResult> {
    if (!entity.versions)
      await entity.getVersions()
    let children = entity.versions!.map(version => this.searchVersion(version, token))

    if (entity.name.toLowerCase().match(token.query.toLowerCase()))
      return new SearchResult(token, entity)
    if (entity.resource.toLowerCase().match(token.query.toLowerCase()))
      return new SearchResult(token, entity)

    return await this.childSearches(token, entity, children)
  }

  async searchVersion(version: Version, token: SearchToken): Promise<SearchResult> {
    return new SearchResult(token, version, new Error('Method not implemented.'))
  }
}

class AggregateError extends Error {
  errors: any[]

  constructor(message?: string, ...errors: Error[]) {
    super(message)
    this.errors = errors
  }
}

export class SearchToken {
  query: string

  constructor(query: string) {
    this.query = query
  }
}

export class SearchResult {
  token: SearchToken
  item: object
  success: boolean
  error?: Error

  get active() {
    return this.token === currentToken
  }

  constructor(token: SearchToken, item: object, error?: Error) {
    this.token = token
    this.item = item
    this.success = !error
    if (error)
      this.error = error

    resultSource.next(this)
  }
}