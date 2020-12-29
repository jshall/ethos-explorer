const AdmZip = require("adm-zip")
const ejs = require('ejs')
const fs = require('fs-extra')
const path = require('path')
const papa = require('papaparse')
const YAML = require('yaml')

const rel = p => path.resolve(__dirname, p)

function extract(filename) {
    if (!fs.existsSync(filename)) {
        throw `${filename} not found! Please download from https://resources.elluciancloud.com/ethos-data-model`
    }
    let zip = new AdmZip(filename)
    console.log(`Extracting ${filename}...`)
    zip.extractAllTo('.')
}

const zip = rel('../ellucian_ethos_sdk.zip')
if (fs.existsSync(rel('../ellucian_ethos_sdk'))) {
    console.log(`${zip} has already been unpacked.`)
} else {
    extract(zip)
}

console.log('Parsing domains...')
const domains = require('../ellucian_ethos_sdk/data_dictionary/structure/domainEntities.json')

function createEntry(filename, template, data) {
    let entry = template
    for (const key of Object.keys(data)) {
        let re = new RegExp(`const ${key}!(: .*)(?=\n|$)`)
        let s = `const ${key}$1 = ${JSON.stringify(data[key])}`
        entry = entry.replace(re, s)
    }
    entry = entry.replace(/"getVersions:(.*?):(.*?)"/g, "async () => (await import(/* webpackChunkName: 'ethos.$1' */ './$1')).content")
    fs.ensureFileSync(filename)
    fs.writeFileSync(filename, entry)
}

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


function expand(obj, prop, fallback) {
    if (typeof obj !== 'object')
        throw '\'obj\' is not and object'
    let prop2, key
    if (prop instanceof Array)
        [prop, prop2, key] = prop
    if (!key)
        return obj.hasOwnProperty(prop)
            ? obj[prop]
            : (obj[prop] = fallback)
    if (!obj.hasOwnProperty(prop))
        obj[prop] = []
    let item = obj[prop].find(i => i[prop2] === key)
    if (!item) {
        item = {}
        item[prop2] = key
        obj[prop].push(item)
    }
    return item
}

console.log('Parsing lineage...')
let lineage = fs.readFileSync(rel('../ellucian_ethos_sdk/data_dictionary/all-lineage.csv'), 'utf8')
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

function forEachPair(obj, func) {
    for (let [key, value] of Object.entries(obj)) {
        func(key, value)
    }
}

console.log('Parsing definitions...')
const defs = rel('../ellucian_ethos_sdk/ethos_data_models_and_apis/src')
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

const indexTemplate = fs.readFileSync(rel('./index.template.ts'), 'utf8')
createEntry('src/ethos/index.ts', indexTemplate, { systems, domains })

const packageTemplate = fs.readFileSync(rel('./package.template.ts'), 'utf8')
forEachPair(packages, (package, content) => {
    createEntry(`src/ethos/${package}.ts`, packageTemplate, { content })
})

console.log('Completed generation of Ethos data files.\n')
