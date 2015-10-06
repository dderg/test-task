'use strict';

const expect = require('chai').expect;
const spawn = require('child_process').spawn;

let amountOfNodes = 5;

describe('main', function () {
    it('should make only one generator', function (done) {
        let generatorsCreated = 0;
        setTimeout(() => {
            expect(generatorsCreated).to.equal(1);
            done();
        }, 1900);
        function spawnOne() {
            let process = spawn('node', ['index.js']);
            process.stdout.on('data', function (data) {
                console.log(data.toString());
                if (data.toString().replace(/(\r\n|\n|\r)/gm, '').trim() === 'generator created') {
                    generatorsCreated++;
                }
            });
            if (amountOfNodes--) {
                setTimeout(spawnOne, 50);
            }
        }
        spawnOne();
    });
});
