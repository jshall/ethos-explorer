export const EthosData: IEthosData

export interface IEthosData {
    systems: string[]
    domains: Domain[]
    entities: { [name: string]: Entity }
}

export interface Domain {
    name: string
    subdomains?: Domain[]
    entities?: Entity[]

    contains(item: Entity | Version): boolean
}

export interface Entity {
    resource: string
    name: string
    representationType: string
    path: string[]
    package: string
    versions?: Version[]

    getVersions(): Promise<Version[]>
    contains(version: Version): boolean
}

export interface Package {
    [name: string]: Version[]
}

export interface Version {
    entity: Entity
    name: string
    schema: any
    systems: { [name: string]: System }
}

export interface System {
    name: string
    api?: any
    properties?: { [name: string]: Property }
}

export interface Property {
    from?: {
        object: string
        field: string
        notes: string
    }
    ref?: {
        object: string
        field: string
    }
    UI?: string
}