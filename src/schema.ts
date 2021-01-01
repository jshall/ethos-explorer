abstract class SchemaBase {
    title?: string
    description?: string

    constructor(obj: any) {
        Object.assign(this, obj)
    }

    static from(obj: any): Schema | SubSchema | any {
        switch (obj.type || (obj.oneOf ? 'oneOf' : undefined)) {
            case 'oneOf': return new SchemaOption(obj)
            case 'object': return new SchemaObject(obj)
            case 'array': return new SchemaArray(obj)
            case 'string': return new SchemaString(obj)
            case 'integer': return new SchemaNumber(obj)
            case 'number': return new SchemaNumber(obj)
            case 'boolean': return new SchemaSimple(obj)
            case 'null': return new SchemaSimple(obj)
            default: return new SchemaUnknown(obj)
        }
    }

    abstract toTypeScript(indent?: string): string
}

export type Schema
    = SchemaObject | SchemaArray | SchemaString | SchemaNumber | SchemaSimple
export type SubSchema
    = Schema | SchemaOption

export class SchemaOption extends SchemaBase {
    oneOf!: Schema[]

    constructor(obj: any) {
        super(obj)
        this.oneOf = []
        obj.oneOf?.forEach((i: any) => this.oneOf.push(SchemaBase.from(i)))
    }

    toTypeScript = (indent?: string): string =>
        `${this.oneOf?.map(i => i.toTypeScript(indent)).filter((v, i, s) => s.indexOf(v) === i).join(' | ')}`
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

    constructor(obj: any) {
        super(obj)
        this.properties = {}
        if (typeof obj.properties === 'object')
            Object.entries(obj.properties).forEach(([key, value]) => {
                this.properties[key] = SchemaBase.from(value)
            })
    }

    toTypeScript(indent: string = ''): string {
        let out = '{'
        Object.entries(this.properties).forEach(([name, schema]) => {
            let req = this.required?.includes(name) ? '' : '?'
            out += `\n${indent}\t${name}${req}: ${schema.toTypeScript(`${indent}\t`)}`
        })
        return out + (out.length > 1 ? `\n${indent}}` : '}')
    }
}

export class SchemaArray extends SchemaBase {
    readonly type = 'array'
    items!: SubSchema
    minItems?: number
    maxItems?: number

    constructor(obj: any) {
        super(obj)
        this.items = SchemaBase.from(obj.items)
    }

    toTypeScript = (indent?: string): string =>
        `Array<${this.items.toTypeScript(indent)}>`
}

export class SchemaString extends SchemaBase {
    readonly type = 'string'
    format?: string
    pattern?: string
    maxLength?: number
    minLength?: number
    enum?: string[]

    toTypeScript = () => 'string'
}

export class SchemaNumber extends SchemaBase {
    readonly type!: 'number' | 'integer'
    format?: string
    minimum?: number
    maximum?: number

    toTypeScript = () => 'number'
}

export class SchemaSimple extends SchemaBase {
    type!: 'boolean' | 'null'

    toTypeScript = () => this.type
}

export class SchemaUnknown extends SchemaBase {
    constructor(obj: any) {
        super(obj)
        console.warn('Unknown schema:', obj)
    }
    toTypeScript = () => 'unknown'
}