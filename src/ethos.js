import files from '../ellucian_ethos_sdk/files.json';
import structure from '../ellucian_ethos_sdk/data_dictionary/structure/domainEntities.json';
import lineage from '../ellucian_ethos_sdk/data_dictionary/all-lineage.csv';

const resources = {};

function track(entity) { resources[entity.resource] = entity; }
function indexDomain(domain) {
    if (domain.entities) {
        domain.entities.forEach(entity => track(entity));
    }
    if (domain.subdomains) {
        domain.subdomains.forEach(domain => indexDomain(domain));
    }
}
structure.forEach(domain => indexDomain(domain));

function goto(obj, prop, fallback) {
    return obj.hasOwnProperty(prop)
        ? obj[prop]
        : (obj[prop] = fallback);
}

lineage.forEach(item => {
    if (item.sourceFieldNotes !== 'Not Supported') {
        let prop = resources[item.model]
        prop = goto(prop, 'versions', {})
        prop = goto(prop, item.modver.toString(), {})
        prop = goto(prop, 'sources', {})
        prop = goto(prop, item.src, {})
        prop = goto(prop, 'properties', {})
        prop = goto(prop, item.property, {});

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

export { structure, resources, lineage };