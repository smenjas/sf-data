/**
 * @file Output street addresses with minimal geographic coordinates.
 *
 * Minimal geographic coordinates means:
 *
 * - Round latitude and longitude to fewer decimal places, e.g. 4.
 * - Keep only the decimal portion, since all of SF is at 37°N 122°W.
 */

import addrs from './data/sf-addresses-full.js';

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

console.log('export default {');
for (const st in out) {
    console.log(`${st}:`, out[st]);
}
console.log('};');

/*

Usage:
$ node refine-addresses.js > data/sf-addresses-min.js
$ view -c 'syn off' data/sf-addresses-min.js

*/
