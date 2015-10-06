'use strict';

const redis = require('redis');
const client = redis.createClient();
const crypto = require('crypto');

function generateHash() {
    let sha = crypto.createHash('sha1');
    sha.update(Math.random().toString());
    sha.update(new Date().toString());
    return sha.digest('hex');
}

const appID = generateHash();

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

let generatorInterval;

function checkOverwriten() {
    client.get('generatorID', function (err, res) {
        if (res !== appID) {
            stopGenerator();
        }
    });
}

function startGenerator() {
    // Если в бд будут задержки то в текущей реализации могут быть запущены 2 генератора..
    console.log('generator created');
    client.set('generatorID', appID);
    function updateHash() {
        client.set('generatorHash', generateHash());
    }
    updateHash();
    generatorInterval = setInterval(() => {
        updateHash();
        checkOverwriten();
    }, 200);

};

function stopGenerator() {
    console.log('generator removed');
    clearInterval(generatorInterval);
}

let lastHex;
function checkIfExpired() {
    client.get('generatorHash', function (err, res) {
        console.log(lastHex);
        if (res === lastHex) {
            startGenerator();
        }
        lastHex = res;
    });
}
checkIfExpired();
setInterval(() => {
    checkIfExpired();
}, 500);
