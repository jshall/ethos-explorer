class SchemaBase {
    title?: string
    description?: string
}

export type Schema
    = SchemaObject | SchemaArray | SchemaString | SchemaNumber | SchemaSimple
export type SubSchema
    = Schema | SchemaOption

export class SchemaOption extends SchemaBase {
    oneOf!: Schema[]
}

export class SchemaObject extends SchemaBase {
    readonly type = 'object'
    format?: string
    version?: string
    properties!: { [name: string]: SubSchema }
    required?: string[]
    additionalProperties?: boolean
    maxProperties?: number
    minProperties?: number
    //links?: unknown
}

export class SchemaArray extends SchemaBase {
    readonly type = 'array'
    items!: SubSchema
    minItems?: number
    maxItems?: number
}

export class SchemaString extends SchemaBase {
    readonly type = 'string'
    format?: string
    pattern?: string
    maxLength?: number
    minLength?: number
    enum?: string[]
}

export class SchemaNumber extends SchemaBase {
    readonly type!: 'number' | 'integer'
    format?: string
    minimum?: number
    maximum?: number
}

export class SchemaSimple extends SchemaBase {
    type!: 'boolean' | 'null'
}