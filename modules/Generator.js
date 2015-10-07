'use strict';

const crypto = require('crypto');
const config = require('../config.json');
function generateHash() {
    let sha = crypto.createHash('sha1');
    sha.update(Math.random().toString() + new Date().valueOf().toString());
    return sha.digest('hex');
}

class Generator {
    constructor (client) {
        this.client = client;
        this.active = false;
        this.watch();
    }

    start () {
        console.log('generator created');
        this.id = generateHash();
        this.client.set('generatorID', this.id, () => {
            this.active = true;
            this.__onRunning();
            clearInterval(this.expiredInterval);
            this.interval = setInterval(() => {
                this.__onRunning();
            }, 120);
            this.messageInterval = setInterval(() => {
                this.client.rpush('messages', this.__getMessage());
            }, config.generatorTimeout);
        });
    }

    stop () {
        console.log('generator removed');
        this.active = false;
        clearInterval(this.interval);
        clearInterval(this.messageInterval);
        this.watch();
        if (this.onStop) {
            this.onStop();
        }
    }

    // watches if there's generators active and starts one if needed
    watch () {
        this.lastHex = null;
        this.__checkIfExpired();
        this.expiredInterval = setInterval(() => {
            this.__checkIfExpired();
        }, 500);
    }

    __checkIfExpired () {
        this.client.get('generatorHash', (err, res) => {
            if (res === this.lastHex) {
                console.log('expired');
                this.start();
            }
            this.lastHex = res;
        });
    }

    __getMessage () {
        this.cnt = this.cnt || 0;
        return this.cnt++;
    }

    __onRunning () {
        this.__updateHash();
        this.__checkOverwriten();
    }

    __updateHash () {
        this.client.set('generatorHash', generateHash());
    }

    __checkOverwriten () {
        this.client.get('generatorID', (err, res) => {
            if (res !== this.id) {
                this.stop();
            }
        });
    }

}

module.exports = Generator;
