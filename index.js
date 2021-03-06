var Crawler = require("crawler");
var jsonfile = require('jsonfile')
const resources = require('./resources.json');

const c = new Crawler({
    callback: function (error, res, done) {
        if (error) {
            console.log(error)
        } else {
            console.log("final cb");
        }
        done();
    }
});

const sanitize = (c) => {
    if (!c) return "0.00";
    let n = c.toString()
        .replace("€", "")               // remove €
        .replace(",", ".")              // number format
        .replace(/[^\d.-]/g, '');     // trim string
    return parseFloat(n);
};

const cbGenerator = (schema, origin, componentKey, componentTypeKey) => {
    return (error, res, done) => {
        if (error) {
            console.log(error);
        } else {
            var $ = res.$;
            console.log(componentTypeKey + " >>  " + componentKey + ">  - prezzo " + origin + " ", sanitize($(schema).text()));



            if (!objToBeSaved[componentTypeKey]){
                objToBeSaved[componentTypeKey] = {};
            }

            if (!objToBeSaved[componentTypeKey][componentKey]) {
                objToBeSaved[componentTypeKey][componentKey] = [];
            }

            objToBeSaved[componentTypeKey][componentKey].push({
                origin: origin,
                price: sanitize($(schema).text())
            });

            objToBeSaved[componentTypeKey][componentKey] = objToBeSaved[componentTypeKey][componentKey].sort( (a, b) => a.price - b.price);

            jsonfile.writeFile("data.json", objToBeSaved, {
                spaces: 4
            }, function (err) {
                if (err) {
                    console.error(err);
                }
            });
        }
        done();
    };
}



let arrToBeParsed = [];
let objToBeSaved = {};

Object.entries(resources.components).forEach(([componentTypeKey, componentTypeValue], i) => {
    Object.entries(resources.components[componentTypeKey]).forEach(([componentKey, componentValue]) => {
        arrToBeParsed = arrToBeParsed.concat(resources.components[componentTypeKey][componentKey].options.reduce((acc, val) => {
            acc.push({
                uri: val.URL,
                callback: cbGenerator(resources.schemas[val.schema], val.schema, componentKey, componentTypeKey)
            });
            return acc;
        }, []));
    });
});

c.queue(arrToBeParsed);
