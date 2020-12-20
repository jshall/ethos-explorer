const AdmZip = require("adm-zip");
const fs = require('graceful-fs');
const path = require('path');

exports.unpack = async () => {
    const filename = 'ellucian_ethos_sdk.zip';

    function dirTree(filename, obj) {
        if (!obj) { obj = {} }
        var stats = fs.lstatSync(filename),
            info = obj[path.basename(filename)] = {
                path: filename
            };

        if (stats.isDirectory()) {
            info.children = {};
            fs.readdirSync(filename).forEach(child => {
                dirTree(filename + '/' + child, info.children);
            });
        }

        return obj;
    }

    function extract() {
        if (!fs.existsSync(filename)) {
            throw `${filename} not found! Please download from https://resources.elluciancloud.com/ethos-data-model`;
        }
        let zip = new AdmZip(filename);
        console.log(`Extracting ${filename}...`)
        zip.extractAllTo('.');
        const files = dirTree('ellucian_ethos_sdk');
        fs.writeFileSync( 'ellucian_ethos_sdk/files.json', JSON.stringify(files));
    }

    if (fs.existsSync('ellucian_ethos_sdk')) {
        console.log(`${filename} has already been unpacked.`);
    } else {
        extract();
    }
}