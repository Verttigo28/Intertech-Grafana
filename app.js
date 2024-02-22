const express = require('express');
const client = require('prom-client');
const request = require('request');
const convert = require('xml-js');

const app = express();

const register = new client.Registry();

const liveCurrent = new client.Gauge({name: "pdu_live_Current", help: "Live current from the PDU"});
const pduState = new client.Gauge({name: "pdu_state", help: "Pdu State"});
const temp = new client.Gauge({name: "pdu_temp", help: "PDU temp"});
const humidity = new client.Gauge({name: "pdu_hum", help: "PDU humidity"});
const outlet1 = new client.Gauge({name: "pdu_Outlet1", help: "State of outlet 1",});
const outlet2 = new client.Gauge({name: "pdu_Outlet2", help: "State of outlet 2"});
const outlet3 = new client.Gauge({name: "pdu_Outlet3", help: "State of outlet 3"});
const outlet4 = new client.Gauge({name: "pdu_Outlet4", help: "State of outlet 4"});
const outlet5 = new client.Gauge({name: "pdu_Outlet5", help: "State of outlet 5"});
const outlet6 = new client.Gauge({name: "pdu_Outlet6", help: "State of outlet 6"});
const outlet7 = new client.Gauge({name: "pdu_Outlet7", help: "State of outlet 7"});
const outlet8 = new client.Gauge({name: "pdu_Outlet8", help: "State of outlet 8"});

register.registerMetric(liveCurrent);
register.registerMetric(pduState);
register.registerMetric(temp);
register.registerMetric(humidity);
register.registerMetric(outlet1);
register.registerMetric(outlet2);
register.registerMetric(outlet3);
register.registerMetric(outlet4);
register.registerMetric(outlet5);
register.registerMetric(outlet6);
register.registerMetric(outlet7);
register.registerMetric(outlet8);

function transformValue(path) {
    switch (path) {
        case "on":
            return 1
        case "off":
            return 0
        case "normal":
            return 1
        case "warning":
            return 2
        case "Overload":
            return 3
    }
}

function updateMetrics() {
    request('http://10.99.99.11/status.xml', function (error, response, body) {
        let result = JSON.parse(convert.xml2json(body, {compact: true, spaces: 2}));
        liveCurrent.set(Math.round(parseFloat(result.response.cur0._text) * 100) / 100)

        pduState.set(transformValue(result.response.stat0._text))

        temp.set(parseFloat(result.response.tempBan._text))
        humidity.set(parseFloat(result.response.humBan._text))

        outlet1.set(transformValue(result.response.outletStat0._text))
        outlet2.set(transformValue(result.response.outletStat1._text))
        outlet3.set(transformValue(result.response.outletStat2._text))
        outlet4.set(transformValue(result.response.outletStat3._text))
        outlet5.set(transformValue(result.response.outletStat4._text))
        outlet6.set(transformValue(result.response.outletStat5._text))
        outlet7.set(transformValue(result.response.outletStat6._text))
        outlet8.set(transformValue(result.response.outletStat7._text))
    });
}

// Create a route to expose metrics
app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    updateMetrics();
    res.send(await register.metrics());
});

app.listen(3000, () => {
    updateMetrics()
    console.log("Server is running on port 3000");
});