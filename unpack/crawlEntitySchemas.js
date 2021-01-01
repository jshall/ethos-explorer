const C = require("chalk")
const { forEachPair } = require("./utils")

const common = ['title', 'description']
const commonType = [...common, 'type']
const formatibleType = [...commonType, 'format']
const numericType = [...formatibleType, 'minimum', 'maximum']
const expect = {
  _: {
    allow: [...common, 'oneOf'],
    tests: [
      (path, props) => console.assert(props.includes('oneOf'), C.yellow`Unrecognized schema at ${path}`),
    ]
  },
  object: {
    allow: [...formatibleType, 'version', 'properties', 'required', 'additionalProperties', 'maxProperties', 'minProperties', 'links'],
    tests: [
      (path, props, schema) => console.assert(schema.maxProperties === 0 || props.includes('properties'), C.yellow`Missing "properties" at ${path}`),
      //(path, props, schema) => console.assert(!schema.links, C.yellow`Links will not be processed at ${path}`),
    ]
  },
  array: {
    allow: [...commonType, 'items', 'minItems', 'maxItems'],
    tests: [
      (path, props) => console.assert(props.includes('items'), C.yellow`Missing items definition at ${path}`),
    ]
  },
  string: { allow: [...formatibleType, 'pattern', 'maxLength', 'minLength', 'enum'], tests: [] },
  number: { allow: numericType, tests: [] },
  integer: { allow: numericType, tests: [] },
  null: { allow: commonType, tests: [] },
  boolean: { allow: commonType, tests: [] },
}

function validate(schema, path) {
  const type = schema.type || '_'
  const types = Object.keys(expect)
  const props = Object.keys(schema)
  const allow = expect[type].allow
  const tests = expect[type].tests
  console.assert(types.includes(type), C.yellow`Unexpected type "${type}" in ${path}`)
  props.forEach(prop =>
    console.assert(allow.includes(prop), C.yellow`Unexpected property "${prop}" in ${path}`)
  )
  tests.forEach(test => test(path, props, schema))
}

function crawlSchema(schema, path) {
  process.stdout.clearLine()
  process.stdout.write(path.substring(0, process.stdout.columns))
  process.stdout.cursorTo(0)
  validate(schema, path)
  if (schema.items && schema.maxItems !== 0)
    crawlSchema(schema.items, path)
  if (schema.oneOf)
    schema.oneOf.forEach(v => crawlSchema(v, path))
  if (schema.properties)
    forEachPair(schema.properties, (k, v) => crawlSchema(v, `${path}.${k}`))
  process.stdout.clearLine()
}

exports.crawlEntitySchemas = entities => {
  console.log('Crawling schemas...')
  forEachPair(entities, (entityName, entity) => {
    let versions = entity.versions
    entity = entity.entity
    versions.forEach(version => {
      if (!version.schema)
        return console.warn(C.yellow`${entityName} v${version.name} schema not found.`)
      crawlSchema(version.schema, `${entityName}[${version.name}]`)
    })
  })
}