/**
 * @file Output street segments with minimal geographic coordinates.
 *
 * Minimal geographic coordinates means:
 *
 * - Round latitude and longitude to fewer decimal places, e.g. 5.
 * - Keep only the decimal portion, since all of SF is at 37°N 122°W.
 */

import { distillCoord } from './lib.js';
import segments from './data/Streets___Active_and_Retired_20250625.js';

/**
 * Remove trailing zeroes from a Centerline-Network Number (CNN).
 * @param {string} cnn - A Centerline-Network Number
 * @param {string} A Centerline-Network Number prefix
 */
function truncateCNN(cnn) {
    if (!cnn) {
        return cnn;
    }
    if (cnn.substring(5, 8) !== '000') {
        console.log(cnn, 'does not end in: 000');
        return cnn;
    }
    return parseInt(cnn.substring(0, 5));
}

/**
 * Parse a line string of geographic coordinates into an array.
 *
 * @example
 * const line = 'LINESTRING (-122.457446473 37.798032343, -122.457996647 37.797312546)';
 * const lls = parseLine(line);
 * // Returns: [[79803, 45745], [79731, 458]]
 *
 * @param {string} line - A line string
 * @returns {Array.<number>} Decimal portion of degrees latitude and longitude
 */
function parseLine(line) {
    const decimals = 5;
    const start = line.indexOf('(') + 1;
    const stop = line.indexOf(')');
    const pairs = line.substring(start, stop).split(',');
    const lls = [];
    for (let pair of pairs) {
        pair = pair.trim();
        const [lon, lat] = pair.split(' ');
        const latDec = distillCoord(lat, decimals, 3);
        const lonDec = distillCoord(lon, decimals, 5);
        lls.push([latDec, lonDec]);
    }
    return lls;
}

/**
 * Determine whether a street is a dead end.
 *
 * @param {string} street - A street name, maybe
 * @returns {boolean} Whether the input indicates a dead end
 */
function isDeadEnd(street) {
    return street === 'START' || street === 'END' ||
        street.startsWith('START:') || street.startsWith('END:');
}

/**
 * Add an element to an array, if it's not already there.
 *
 * @param {Array} array - An array
 * @param {*} value - A value
 */
function addElement(array, value) {
    if (!array.includes(value)) {
        array.push(value);
    }
}

const driving = true;
const walking = false;
const out = {};
const re = /[#']/g;

for (const segment of segments) {
    //if (segment.active === 'false') continue;
    if (!driving) {
        if (segment.layer === 'FREEWAYS') continue;
    }
    if (segment.layer === 'PAPER') continue;
    if (segment.layer === 'PAPER_FWYS') continue;
    if (segment.layer === 'PAPER_WATER') continue;
    //if (segment.layer === 'PRIVATE') continue;
    if (segment.layer === 'PRIVATE_PARKING') continue;
    if (!walking) {
        if (segment.layer === 'PSEUDO') continue;
        if (segment.layer === 'STREETS_PEDESTRI') continue;
        if (segment.layer === 'UPROW') continue;
    }
    const cnn = segment.cnn;
    if (cnn in out) {
        console.log('//', cnn, 'already present.');
    }
    const fro = truncateCNN(segment.f_node_cnn);
    const to = truncateCNN(segment.t_node_cnn);
    if (!fro || !to) {
        continue;
    }
    const lls = parseLine(segment.line);
    if (lls.length < 3) {
        continue;
    }
    lls.shift();
    lls.pop();
    const key = [fro, to].sort().join('-');
    if (key.startsWith(to)) {
        lls.reverse();
    }
    out[key] = lls;
}

console.log('export default {');
for (const key in out) {
    const lls = out[key];
    let pairs = [];
    for (const ll of lls) {
        const pair = ll.join(',');
        pairs.push(`[${pair}]`);
    }
    console.log(`'${key}':[${pairs.join(',')}],`);
}
console.log('};');

/*

Usage:
$ node refine-segments.js > data/sf-segments.js
$ view -c 'syn off' data/sf-segments.js

*/
