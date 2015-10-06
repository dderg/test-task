'use strict';

const redis = require('redis');
const client = redis.createClient();

const Generator = require('./modules/Generator');

const gen = new Generator(client);

client.on('error', function (error) {
    console.error(error);
});

function eventHandler(msg, callback) {
    function onComplete() {
        var error = Math.random() > 0.85;
        callback(error, msg);
    }
    // processing takes time...
    setTimeout(onComplete, Math.floor(Math.random() * 1000));
};

function checkServerForMessages() {
    client.lpop('messages', function (err, data) {
        if (data !== null) {
            console.log(data);
        }
        eventHandler(data, (error, msg) => {
            if (error) {
                // handle errors
            }
            checkServerForMessages();
        });
    });
}

checkServerForMessages();
