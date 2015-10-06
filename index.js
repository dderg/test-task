'use strict';

const redis = require('redis');
const client = redis.createClient();
const crypto = require('crypto');

client.on('error', function (error) {
    console.error(error);
});

function getMessage() {
    this.cnt = this.cnt || 0;
    return this.cnt++;
}

function eventHandler(msg, callback) {
    function onComplete() {
        var error = Math.random() > 0.85;
        callback(error, msg);
    }
    // processing takes time...
    setTimeout(onComplete, Math.floor(Math.random() * 1000));
}

let lastHex;
function startGenerator() {
    function updateHash() {
         let sha = crypto.createHash('sha1');
        sha.update(Math.random().toString());
        sha.update(new Date().toString());
        let hex = sha.digest('hex');
        client.set('generatorHash', hex);
    }
    setInterval(() => {
        updateHash();
    }, 200);
    updateHash();
}

setInterval(() => {
    client.get('generatorHash', function (err, res) {
        console.log(res === lastHex);
        lastHex = res;
    });
}, 500);
