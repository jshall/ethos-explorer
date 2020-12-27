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
    let entry = ejs.render(template, data)
    fs.ensureFileSync(filename)
    fs.writeFileSync(filename, entry)
}

const resources = {}
const packages = {}

function indexEntity(entity, ...path) {
    const versions = {}
    const package = path.reduce((p, n) => p + '.' + n.toLowerCase().replace(/ /g, '-'), '').substring(1)
    resources[entity.resource] = { entity, versions }
    expand(packages, package, {})[entity.resource] = versions
    entity.getVersions = `getVersions:${package}:${entity.resource}`
}
function indexDomain(domain, ...path) {
    path = [...path, domain.name]
    domain.entities?.forEach(entity => indexEntity(entity, ...path))
    domain.subdomains?.forEach(domain => indexDomain(domain, ...path))
    if (domain.entities) {
        domain.resources = domain.entities
        delete domain.entities
    }
}
domains.forEach(domain => indexDomain(domain))


function expand(obj, prop, fallback) {
    if (typeof obj !== 'object')
        throw '\'obj\' is not and object'
    return obj.hasOwnProperty(prop)
        ? obj[prop]
        : (obj[prop] = fallback)
}

console.log('Parsing lineage...')
let lineage = fs.readFileSync(rel('../ellucian_ethos_sdk/data_dictionary/all-lineage.csv'), 'utf8')
lineage = papa.parse(lineage, { header: true, transformHeader: h => h.trim(), skipEmptyLines: true }).data
lineage.forEach(item => {
    if (item.sourceFieldNotes !== 'Not Supported') {
        let prop = resources[item.model]
        prop = expand(prop, 'versions', {})
        prop = expand(prop, item.modver.toString(), {})
        prop = expand(prop, 'sources', {})
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
const sources = lineage.map(i => i.src).filter((v, i, s) => s.indexOf(v) === i)
fs.readdirSync(defs).forEach(resName => {
    const res = resources[resName]
    fs.readdirSync(path.join(defs, resName)).forEach(ver => {
        const version = expand(expand(res, 'versions', {}), ver, {})
        const files = fs.readdirSync(path.join(defs, resName, ver))
        let file = resName + '.json'
        version.schema = require(path.join(defs, resName, ver, file))
        sources.forEach(src => {
            if (files.includes(file = src.toLowerCase() + '-' + resName + '.yaml')) {
                let source = expand(expand(version, 'sources', {}), src, {})
                source.api = YAML.parse(fs.readFileSync(path.join(defs, resName, ver, file), 'utf8'))
            }
        })
    })
})

console.log('Creating files...')

fs.rmdirSync('ethos', { recursive: true })
fs.ensureDirSync('ethos')
fs.readdirSync(rel('.')).filter(n => n.match('.d.ts')).forEach(def => {
    fs.linkSync(rel('./' + def), 'ethos/' + def)
})

const indexTemplate = fs.readFileSync(rel('./index.ejs'), 'utf8')
createEntry('./ethos/index.js', indexTemplate, { sources, domains })

const packageTemplate = fs.readFileSync(rel('./package.ejs'), 'utf8')
forEachPair(packages, (package, content) => {
    createEntry(`./ethos/${package}.js`, packageTemplate, { content })
})

console.log('Completed generation of Ethos data files.\n')
