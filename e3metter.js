const request = require("request");
const {parse} = require('node-html-parser');
const express = require('express');
const client = require('prom-client');

const app = express();
const register = new client.Registry();

const liveCLeft = new client.Gauge({name: "pdu_LC_left", help: "Live current from the PDU left"});
const liveCRight = new client.Gauge({name: "pdu_LC_right", help: "Live current from the PDU right"});
register.registerMetric(liveCLeft);
register.registerMetric(liveCRight);

function updateMetrics() {
    request('http://192.168.234.199/', async function (error, response, body) {
        liveCRight.set(getWatts(body))
    });
    request('http://192.168.234.200/', async function (error, response, body) {
        liveCLeft.set(getWatts(body))
    });
}

function getWatts(HTMLbody) {
    let firstPass = parse(HTMLbody)
    firstPass = firstPass.querySelectorAll("td").toString().replaceAll(",", "")

    let secondPass = parse(firstPass)
    secondPass = secondPass.querySelectorAll(".v")

    let index = 0;
    for (const e of secondPass.values()) {
        if (index === 11) {
            return parseInt(e.toString().replace("<td class=\"v r\">", "").replace("</td>", ""))
        }
        index++;
    }
}

// Create a route to expose metrics
app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    updateMetrics();
    res.send(await register.metrics());
});

app.listen(3002, () => {
    updateMetrics()
    console.log("Server is running on port 3002");
});