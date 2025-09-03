/**
 * @file Output street addresses with minimal geographic coordinates.
 *
 * Minimal geographic coordinates means:
 *
 * - Round latitude and longitude to fewer decimal places, e.g. 4.
 * - Keep only the decimal portion, since all of SF is at 37°N 122°W.
 */

import { distill, round } from './lib.js';
import addrs from './data/sf-addresses-full.js';

const out = {};
const decimals = 4;
//const stop = 10;
//let count = 0;

for (const addr of addrs) {
    const st = addr.st;
    if (!(st in out)) {
        out[st] = {};
    }
    const lat = distill(round(addr.lat, decimals), 3);
    const lon = distill(round(addr.lon, decimals), 5);
    out[st][addr.num] = [lat, lon];
    //console.log(addr.lat, lat, addr.lon, lon, addr.num, st);
    //if (++count >= stop) break;
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
