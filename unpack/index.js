const fs = require('fs-extra')
const path = require('path')
const papa = require('papaparse')
const YAML = require('yaml')
const { forEachPair, extract, expand, createFile, resolve } = require("./utils")
const { crawlEntitySchemas } = require('./crawlEntitySchemas')

extract('../ellucian_ethos_sdk.zip', '../ellucian_ethos_sdk')

console.log('Parsing domains...')
const domains = require('../ellucian_ethos_sdk/data_dictionary/structure/domainEntities.json')

const entities = {}
const packages = {}

function indexEntity(entity, ...path) {
    const versions = []
    const package = path.reduce((p, n) => p + '.' + n.toLowerCase().replace(/ /g, '-'), '').substring(1)
    entities[entity.resource] = { entity, versions }
    expand(packages, package, {})[entity.resource] = versions
    entity.getVersions = `getVersions:${package}:${entity.resource}`
}
function indexDomain(domain, ...path) {
    path = [...path, domain.name]
    domain.entities?.forEach(entity => indexEntity(entity, ...path))
    domain.subdomains?.forEach(domain => indexDomain(domain, ...path))
}
domains.forEach(domain => indexDomain(domain))

console.log('Parsing lineage...')
let lineage = fs.readFileSync('ellucian_ethos_sdk/data_dictionary/all-lineage.csv', 'utf8')
lineage = papa.parse(lineage, { header: true, transformHeader: h => h.trim(), skipEmptyLines: true }).data
lineage.forEach(item => {
    if (item.sourceFieldNotes !== 'Not Supported') {
        let prop = entities[item.model]
        prop = expand(prop, ['versions', 'name', item.modver.toString()])
        prop = expand(prop, 'systems', {})
        prop = expand(prop, item.src, {})
        prop = expand(prop, 'properties', {})
        prop = expand(prop, item.property, {})

        if (prop) {
            if (item.sourceObjectName || item.sourceFieldName || item.sourceFieldNotes) {
                prop.from = {
                    object: item.sourceObjectName,
                    field: item.sourceFieldName,
                    notes: item.sourceFieldNotes
                }
            }
            if (item.sourceReferenceObject || item.sourceReferenceField) {
                prop.ref = {
                    object: item.sourceReferenceObject,
                    field: item.sourceReferenceField
                }
            }
            if (item.primarySourceUI) {
                prop.UI = item.primarySourceUI
            }
        }
    }
})

console.log('Parsing definitions...')
const defs = resolve('../ellucian_ethos_sdk/ethos_data_models_and_apis/src')
const systems = lineage.map(i => i.src).filter((v, i, s) => s.indexOf(v) === i)
fs.readdirSync(defs).forEach(resName => {
    const res = entities[resName]
    fs.readdirSync(path.join(defs, resName)).forEach(ver => {
        const version = expand(res, ['versions', 'name', ver])
        const files = fs.readdirSync(path.join(defs, resName, ver))
        let file = resName + '.json'
        version.schema = require(path.join(defs, resName, ver, file))
        systems.forEach(src => {
            if (files.includes(file = src.toLowerCase() + '-' + resName + '.yaml')) {
                let system = expand(expand(version, 'systems', {}), src, {})
                system.api = YAML.parse(fs.readFileSync(path.join(defs, resName, ver, file), 'utf8'))
            }
        })
    })
})

console.log('Creating files...')

fs.rmdirSync('src/ethos', { recursive: true })

const indexTemplate = fs.readFileSync(resolve('index.template.ts'), 'utf8')
createFile('src/ethos/index.ts', indexTemplate, { systems, domains })

const packageTemplate = fs.readFileSync(resolve('package.template.ts'), 'utf8')
forEachPair(packages, (package, content) =>
    createFile(`src/ethos/${package}.ts`, packageTemplate, { content })
)

console.log('Completed generation of Ethos data files.\n')

crawlEntitySchemas(entities) // check schema for unexpected data
