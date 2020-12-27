export const EthosData: IEthosData

export interface IEthosData {
    sources: string[]
    domains: IDomain[]
    resources: { [name: string]: IResource }
}

export interface IDomain {
    name: string
    subdomains?: IDomain[]
    resources?: IResource[]

    contains(item: IResource | IVersion): boolean
}

export interface IResource {
    resource: string
    name: string
    representationType: string
    path: string[]
    package: string
    versions?: IVersion[]

    getVersions(): Promise<IVersion[]>
    contains(version: IVersion): boolean
}

export interface IPackage {
    [name: string]: IVersion[]
}

export interface IVersion {
    name: string
    schema: any
    sources: { [name: string]: ISource }
}

export interface ISource {
    name: string
    api?: any
    properties?: { [name: string]: IProperty }
}

export interface IProperty {
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