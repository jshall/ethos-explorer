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

const zip = 'ellucian_ethos_sdk.zip'
if (fs.existsSync('ellucian_ethos_sdk')) {
    console.log(`${zip} has already been unpacked.`)
} else {
    extract(zip)
}

console.log('Parsing domains...')
const domainEntities = require('../ellucian_ethos_sdk/data_dictionary/structure/domainEntities.json')
var structure = {}

function createEntry(filename, template, data) {
    let entry = ejs.render(template, data)
    fs.ensureFileSync(filename)
    fs.writeFileSync(filename, entry)
}

const resources = {}
const packages = {}

function indexEntity(parent, entity, ...path) {
    const detail = {}
    const packageName = path.reduce((p, n) => p + '.' + n.toLowerCase().replace(/ /g, '-'), '').substring(1)
    parent[entity.name] = entity
    resources[entity.resource] = { packageName, entity, detail }
    expand(packages, packageName, {})[entity.resource] = detail
    entity.detail = `getDetail:${packageName}:${entity.resource}`
}
function indexDomain(parent, domain, ...path) {
    const obj = {}
    parent[domain.name] = obj
    path = [...path, domain.name]
    domain.entities?.forEach(entity => indexEntity(obj, entity, ...path))
    domain.subdomains?.forEach(domain => indexDomain(obj, domain, ...path))
}
domainEntities.forEach(domain => indexDomain(structure, domain))


function expand(obj, prop, fallback) {
    if (typeof obj !== 'object')
        throw '\'obj\' is not and object'
    return obj.hasOwnProperty(prop)
        ? obj[prop]
        : (obj[prop] = fallback)
}

console.log('Parsing lineage...')
let lineage = fs.readFileSync('./ellucian_ethos_sdk/data_dictionary/all-lineage.csv', 'utf8')
lineage = papa.parse(lineage, { header: true, transformHeader: h => h.trim(), skipEmptyLines: true }).data
lineage.forEach(item => {
    if (item.sourceFieldNotes !== 'Not Supported') {
        let prop = resources[item.model]
        prop = expand(prop, 'detail', {})
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
const defs = 'ellucian_ethos_sdk/ethos_data_models_and_apis/src'
const sources = lineage.map(i => i.src).filter((v, i, s) => s.indexOf(v) === i)
fs.readdirSync(defs).forEach(resName => {
    const res = resources[resName]
    fs.readdirSync(path.join(defs, resName)).forEach(ver => {
        const version = expand(expand(res, 'detail', {}), ver, {})
        const files = fs.readdirSync(path.join(defs, resName, ver))
        let file = resName + '.json'
        version.schema = require('../' + path.join(defs, resName, ver, file))
        sources.forEach(src => {
            if (files.includes(file = src.toLowerCase() + '-' + resName + '.yaml')) {
                let source = expand(expand(version, 'sources', {}), src, {})
                source.api = YAML.parse(fs.readFileSync(path.join(defs, resName, ver, file), 'utf8'))
            }
        })
    })
})

const indexTemplate = fs.readFileSync('./gen/index.ejs', 'utf8')
createEntry('./ethos/index.js', indexTemplate, { structure: structure })

const packageTemplate = fs.readFileSync('./gen/package.ejs', 'utf8')
forEachPair(packages, (package, content) => {
    createEntry(`./ethos/${package}.js`, packageTemplate, { content })
})
