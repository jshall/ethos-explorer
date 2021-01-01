const AdmZip = require("adm-zip")
const fs = require('fs-extra')
const path = require('path')

function resolve(p) {
    return path.resolve(__dirname, p);
}

function forEachPair(obj, func) {
    for (let [key, value] of Object.entries(obj)) {
        func(key, value);
    }
}

function extract(filename, testpath) {
    filename = resolve(filename)
    testpath = resolve(testpath)
    if (fs.existsSync(resolve('../ellucian_ethos_sdk'))) {
        console.info(`${path.relative('.',filename)} has already been unpacked.`)
    } else {
        if (!fs.existsSync(filename)) {
            throw `${filename} not found! Please download from https://resources.elluciancloud.com/ethos-data-model`;
        }
        let zip = new AdmZip(filename);
        console.log(`Extracting ${filename}...`);
        zip.extractAllTo('.');
    }
}

function expand(obj, prop, fallback) {
    if (typeof obj !== 'object')
        throw '\'obj\' is not and object';
    let prop2, key;
    if (prop instanceof Array)
        [prop, prop2, key] = prop;
    if (!key)
        return obj.hasOwnProperty(prop)
            ? obj[prop]
            : (obj[prop] = fallback);
    if (!obj.hasOwnProperty(prop))
        obj[prop] = [];
    let item = obj[prop].find(i => i[prop2] === key);
    if (!item) {
        item = {};
        item[prop2] = key;
        obj[prop].push(item);
    }
    return item;
}


function createFile(filename, template, data) {
    let entry = template;
    for (const key of Object.keys(data)) {
        let re = new RegExp(`const ${key}!(: .*)(?=\n|$)`);
        let s = `const ${key}$1 = ${JSON.stringify(data[key])}`;
        entry = entry.replace(re, s);
    }
    entry = entry.replace(/"getVersions:(.*?):(.*?)"/g, "async () => (await import(/* webpackChunkName: 'ethos.$1' */ './$1') as any).content");
    fs.ensureFileSync(filename);
    fs.writeFileSync(filename, entry);
}

exports.resolve = resolve
exports.forEachPair = forEachPair
exports.extract = extract
exports.expand = expand
exports.createFile = createFile
