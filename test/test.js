'use strict';

const expect = require('chai').expect;
const spawn = require('child_process').spawn;

function getStringFromLog(data) {
    return data.toString().replace(/(\r\n|\n|\r)/gm, '').trim();
}

let amountOfNodes = 10;

// Это все нужно скорее для упрощения спавна нескольких процессов чем для реального тестирования

describe('main', function () {
    it('should make only one generator', function (done) {
        let generatorsCreated = 0;
        const processes = [];
        setTimeout(() => {
            expect(generatorsCreated).to.equal(1);
            for (let process of processes) {
                process.kill();
            }
            done();
        }, 9000);
        function spawnOne() {
            let process = spawn('node', ['index.js']);
            processes.push(process);
            process.stdout.on('data', function (data) {
                console.log(data.toString());
                var string = data.toString().replace(/(\r\n|\n|\r)/gm, '').trim();
                if (string === 'generator created') {
                    generatorsCreated++;
                }
                if (string === 'generator removed') {
                    generatorsCreated--;
                }
            });
        }
        for (let i = 0; i < amountOfNodes; i++) {
            spawnOne();
        }
    });

});
