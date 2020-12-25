export interface IDomain {
    [name: string]: IDomain | IResource
}

export interface IResource {
    resource: string
    name: string
    representationType: string
    package: string
    detail: Promise<IVersionList>
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

export const structure: IDomain;
export const resources: { [name: string]: IResource };
