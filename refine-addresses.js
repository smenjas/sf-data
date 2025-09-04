/**
 * @file Output street addresses with minimal geographic coordinates.
 *
 * Minimal geographic coordinates means:
 *
 * - Round latitude and longitude to fewer decimal places, e.g. 4.
 * - Keep only the decimal portion, since all of SF is at 37°N 122°W.
 */

import { distillCoord } from './lib.js';
import addrs from './data/sf-addresses-full.js';

const out = {};
const decimals = 4;

for (const addr of addrs) {
    const st = addr.st;
    if (!(st in out)) {
        out[st] = {};
    }
    const latDec = distillCoord(addr.lat, decimals, 3);
    const lonDec = distillCoord(addr.lon, decimals, 5);
    out[st][addr.num] = [latDec, lonDec];
}

const streets = Object.keys(out);
streets.sort();

console.log('export default {');
for (const st of streets) {
    const addrs = [];
    for (const num in out[st]) {
        const ll = out[st][num];
        addrs.push(`${num}:[${ll.join(',')}]`);
    }
    console.log(`'${st}':{${addrs.join(',')}},`);
}
console.log('};');

/*

Usage:
$ node refine-addresses.js > data/sf-addresses-min.js
$ view -c 'syn off' data/sf-addresses-min.js

*/
