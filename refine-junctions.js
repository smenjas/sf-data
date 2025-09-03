/**
 * @file Output street junctions with minimal geographic coordinates.
 *
 * Minimal geographic coordinates means:
 *
 * - Round latitude and longitude to fewer decimal places, e.g. 5.
 * - Keep only the decimal portion, since all of SF is at 37°N 122°W.
 */

import { distill, round } from './lib.js';
import jcts from './data/sf-intersections-by-cnn.js';

const out = {};
const decimals = 5;
//const stop = 10;
//let count = 0;

for (const cnn in jcts) {
    let { lat, lon } = jcts[cnn];
    if (!(cnn in out)) {
        out[cnn] = {};
    }
    const latDec = distill(round(lat, decimals), 3);
    const lonDec = distill(round(lon, decimals), 5);
    out[cnn].coords = [latDec, lonDec];
    out[cnn].streets = jcts[cnn].streets;
    //console.log(`${lat},${lon}`, out[cnn]);
    //if (++count >= stop) break;
}

console.log('export default {');
for (const cnn in out) {
    console.log(`${cnn}:`, out[cnn], ',');
}
console.log('};');

/*

Usage:
$ node refine-junctions.js > data/sf-junctions.js
$ view -c 'syn off' data/sf-junctions.js

*/
