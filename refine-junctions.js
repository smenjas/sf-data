/**
 * @file Output street addresses with minimal geographic coordinates.
 *
 * Minimal geographic coordinates means:
 *
 * - Round latitude and longitude to fewer decimal places, e.g. 4.
 * - Keep only the decimal portion, since all of SF is at 37°N 122°W.
 */

import jcts from './data/sf-intersections-by-cnn.js';

/**
 * Round a decimal number to a given precision.
 *
 * @param {number} num - The number to round
 * @param {number} precision - How many decimal places to keep
 * @returns {number} The rounded number
 */
function round(num, precision) {
    const factor = 10 ** precision;
    return Math.round(num * factor) / factor;
}

/**
 * Remove the first several characters from a number, and return an integer.
 *
 * The caller should specify a 2nd argument that removes the whole number and
 * the decimal.
 *
 * @example
 * const decimal = distill(37.7553, 3);
 * // Returns: 7553
 *
 * @param {number} num - The number to truncate
 * @param {number} start - How many characters to remove from the beginning
 * @returns {number} The decimal portion, as an integer
 */
function distill(num, start) {
    return parseInt(num.toString().substring(start));
}

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
