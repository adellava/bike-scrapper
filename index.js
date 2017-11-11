var Crawler = require("crawler");
const resources = require('./resources.json');

const c = new Crawler();

const sanitize = (c) => {
    if (!c) return "0.00";
    let n = c.toString()
        .replace("€", "")               // remove €
        .replace(",", ".")              // number format
        .replace(/^\s+|\s+$/g, '');     // trim string
    return n;
};

const cbGenerator = (schema, origin) => {
    return (error, res, done) => {
        if (error) {
            console.log(error);
        } else {
            var $ = res.$;
            console.log("   - prezzo " + origin + " ", sanitize($(schema).text()));
        }
        done();
    };
}



let arrToBeParsed = [];

Object.entries(resources.components).forEach(([componentTypeKey, componentTypeValue]) => {
    console.log(componentTypeKey);
    Object.entries(resources.components[componentTypeKey]).forEach(([componentKey, componentValue]) => {
        console.log(">>"+componentKey);
        arrToBeParsed = arrToBeParsed.concat(resources.components[componentTypeKey][componentKey].options.reduce((acc, val) => {
            acc.push({
                uri: val.URL,
                callback: cbGenerator(resources.schemas[val.schema], val.schema)
            });
            return acc;
        }, []));
    });
});

c.queue(arrToBeParsed);
