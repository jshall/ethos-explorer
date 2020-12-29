const entities: { [name: string]: Entity } = {}

interface DomainData {
    name: string
    subdomains?: DomainData[]
    entities?: EntityData[]
}

interface EntityData {
    representationType: string
    name: string
    resource: string
    getVersions(): Promise<PackageData>
}

interface VersionData {
    name: string
    schema?: any
    systems?: { [name: string]: System }
}

export function sortVersions(a: Version, b: Version): number {
    let [a1, a2, a3] = a.name.split('.').map(n => parseInt(n, 10))
    let [b1, b2, b3] = b.name.split('.').map(n => parseInt(n, 10))
    if (a1 - b1) return a1 - b1
    if (a2 - b2) return a2 - b2
    return a3 - b3
}

export class Domain {
    name: string
    subdomains?: Domain[]
    entities?: Entity[]

    constructor(data: DomainData) {
        this.name = data.name
        if (data.subdomains)
            this.subdomains =
                data.subdomains.map(d => new Domain(d))
        if (data.entities)
            this.entities =
                data.entities.map(e => new Entity(e, this))
    }

    contains(item: Entity | Version): boolean {
        if (this.subdomains)
            if (this.subdomains.some(d => d.contains(item)))
                return true
        if (this.entities)
            return this === (
                (item as Entity).parent ||
                (item as Version).entity?.parent
            )
        return false
    }
}

export class Entity {
    parent: Domain
    resource: string
    name: string
    representationType: string
    versions?: Version[]
    getVersions: () => Promise<Version[]>

    constructor(data: EntityData, parent: Domain) {
        entities[data.resource] = this
        this.parent = parent
        this.resource = data.resource
        this.name = data.name
        this.representationType = data.representationType
        this.getVersions = async () => {
            let pkg = await data.getVersions()
            return this.versions = pkg[data.resource]
                .map(v => new Version(v, this))
                .sort(sortVersions)
        }
    }
}

export interface PackageData {
    [name: string]: VersionData[]
}

export class Version {
    entity: Entity
    name: string
    schema?: any
    systems: { [name: string]: System } = {}

    constructor(data: VersionData, parent: Entity) {
        this.entity = parent
        this.name = data.name
        if (data.schema)
            this.schema = data.schema
        if (data.systems)
            this.systems = data.systems
    }
}

export interface System {
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

const systems!: string[]
const domains!: DomainData[]
export const EthosData = {
    systems,
    domains: domains.map(d => new Domain(d)),
    entities
}