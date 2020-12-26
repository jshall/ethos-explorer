export interface IDomain {
    [name: string]: IDomain | IResource
}

export interface IResourceList {
    [name: string]: IResource
}

export interface IResource {
    resource: string
    name: string
    representationType: string
    path: string[]
    package: string
    getVersions: () => Promise<IVersionList>
    versions?: IVersionList
}

export interface IPackage {
    [name: string]: IVersionList
}

export interface IVersionList {
    [version: string]: IVersion
}

export interface IVersion {
    schema?: any
    sources?: { [name: string]: ISource }
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

export const structure: IDomain
export const resources: IResourceList
