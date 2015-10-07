'use strict';
const redis = require('redis');
const client = redis.createClient();
const Generator = require('./modules/Generator');

let gen;
if (process.argv[2] === 'getErrors') {
    client.lrange('errors', 0, -1, (err, result) => {
        if (err) {
            throw err;
            return;
        }
        console.log(result);
        client.del('errors', (err, reply) => {
            client.end();
        });
    });
} else {
    gen = new Generator(client);
    checkServerForMessages();
    gen.onStop = checkServerForMessages;
}

function eventHandler(msg, callback) {
    function onComplete() {
        var error = Math.random() > 0.85;
        callback(error, msg);
    }
    // processing takes time...
    setTimeout(onComplete, Math.floor(Math.random() * 1000));
};

function checkServerForMessages() {
    if (gen.active) {
        console.log('stop checking because generator is activated on this node');
        return;
    }
    // Смахивает на DDOS, но другого способа не придумал...
    client.rpop('messages', function (err, data) {
        if (err) {
            throw err;
        }
        if (data !== null) {
            eventHandler(data, (error, msg) => {
                // Нужно для проверки миллионного сообщения
                // можно было конечно поставить if, но мне казалось что все упало
                if (data % 1000 === 0) {
                    console.log(data);
                }

                if (error) {
                    client.rpush('errors', msg);
                }
            });
        }
        return checkServerForMessages();
    });
}

