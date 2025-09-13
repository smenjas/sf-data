/**
 * @file Output street junctions with minimal geographic coordinates.
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
 * Create a junction object.
 *
 * @param {Array.<number>} ll - Decimal portion of degrees latitude & longitude
 * @param {string} street - A street name
 * @returns {Object.<string, Array>} A junction object
 */
function createJunction(ll, street) {
    const jct = { ll: ll, streets: [], adj: [] };
    if (!isDeadEnd(street)) {
        jct.streets.push(street.replaceAll(re, ''));
    }
    return jct;
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
    const fro = truncateCNN(segment.f_node_cnn);
    const to = truncateCNN(segment.t_node_cnn);
    if (!fro || !to) {
        continue;
    }
    const lls = parseLine(segment.line);
    if (!(fro in out)) {
        out[fro] = createJunction(lls[0], segment.f_st);
    }
    if (!(to in out)) {
        out[to] = createJunction(lls.at(-1), segment.t_st);
    }
    const streetname = segment.streetname.replaceAll(re, '');
    addElement(out[fro].streets, streetname);
    addElement(out[to].streets, streetname);
    if (segment.oneway !== 'T') {
        addElement(out[fro].adj, to);
    }
    if (segment.oneway !== 'F') {
        addElement(out[to].adj, fro);
    }
}

console.log('export default {');
for (const cnn in out) {
    const jct = out[cnn];
    const ll = jct.ll.join(',');
    const streets = jct.streets.sort().join("','");
    const adj = jct.adj.sort().join(',');
    console.log(`${cnn}:{ll:[${ll}],streets:['${streets}'],adj:[${adj}]},`);
}
console.log('};');

/*

Usage:
$ node refine-junctions.js > data/sf-junctions.js
$ view -c 'syn off' data/sf-junctions.js

*/
