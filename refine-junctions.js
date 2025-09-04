/**
 * @file Output street junctions with minimal geographic coordinates.
 *
 * Minimal geographic coordinates means:
 *
 * - Round latitude and longitude to fewer decimal places, e.g. 5.
 * - Keep only the decimal portion, since all of SF is at 37°N 122°W.
 */

import { distillCoord } from './lib.js';
import cnns from './data/Street_Intersections_20250625.js';

const out = {};
const decimals = 5;

for (const obj of cnns) {
    const { cnn, lat, lon, st_name, st_type } = obj;
    const latDec = distillCoord(lat, decimals, 3);
    const lonDec = distillCoord(lon, decimals, 5);
    const street = `${st_name} ${st_type}`.trim();
    if (cnn in out) {
        //console.log('//', cnn, 'already exists');
        if (latDec !== out[cnn].ll[0]) {
            console.log('//  ', latDec, '!==', out[cnn].ll[0]);
        }
        if (lonDec !== out[cnn].ll[1]) {
            console.log('//  ', lonDec, '!==', out[cnn].ll[1]);
        }
        out[cnn].streets.push(street);
        continue;
    }
    out[cnn] = {};
    out[cnn].ll = [latDec, lonDec];
    out[cnn].streets = [street];
}

console.log('export default {');
for (const cnn in out) {
    const jct = out[cnn];
    const ll = jct.ll.join(',');
    const streets = jct.streets.join("','");
    console.log(`${cnn}:{ll:[${ll}],streets:['${streets}']},`);
}
console.log('};');

/*

Usage:
$ node refine-junctions.js > data/sf-junctions.js
$ view -c 'syn off' data/sf-junctions.js

*/
