export const EthosData: IEthosData

export interface IEthosData {
    sources: string[]
    domains: IDomain[]
    resources: IResourceDictionary
}

export interface IDomain {
    name: string
    subdomains?: IDomain[]
    resources?: IResource[]

    contains(item: IResource | IVersion): boolean
}

export interface IResourceDictionary {
    [name: string]: IResource
}

export interface IResource {
    resource: string
    name: string
    representationType: string
    path: string[]
    package: string
    versions?: IVersionList

    getVersions(): Promise<IVersionList>
    contains(version: IVersion): boolean
}

export interface IPackage {
    [name: string]: IVersionList
}

export interface IVersionList {
    [version: string]: IVersion
}

export interface IVersion {
    schema: any
    sources: { [name: string]: ISource }
}

export interface ISource {
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