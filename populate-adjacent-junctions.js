/**
 * @file Add adjacent street junctions.
 */

import jcts from './data/sf-junctions.js';
//import jctDetails from './data/sf-streets-and-intersections.js';
import jctDetails from './data/streets.js';

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

const not = new Set();
const out = {};
for (let cnn in jcts) {
    const jct = jcts[cnn];
    cnn = truncateCNN(cnn);
    //if (!jct.streets.includes('WATERVILLE ST')) continue;
    const adj = [];
    for (const c in jctDetails) {
        const d = jctDetails[c];
        if (d.active === 'false') continue;
        if (d.layer === 'PAPER') continue;
        if (d.layer === 'PAPER_FWYS') continue;
        if (d.layer === 'PAPER_WATER') continue;
        //if (details.layer === 'STREETS_PEDESTRI') continue;
        const fro = truncateCNN(d.f_node_cnn);
        const to = truncateCNN(d.t_node_cnn);
        if (!fro || !to) {
            continue;
        }
        if (!(`${to}000` in jcts)) {
            not.add(to);
        }
        if (fro === cnn && `${to}000` in jcts && d.oneway !== 'T') {
            if (!adj.includes(to)) adj.push(to);
        }
        if (!(`${fro}000` in jcts)) {
            not.add(fro);
        }
        if (to === cnn && `${fro}000` in jcts && d.oneway !== 'F') {
            if (!adj.includes(fro)) adj.push(fro);
        }
    }
    if (!('coords' in jct) || !Array.isArray(jct.coords) || jct.coords.length < 2) {
        console.log('//', cnn, 'doesn\'t have coords!', jct.coords);
        continue;
    }
    if (!('streets' in jct) || !Array.isArray(jct.coords) || jct.coords.length < 1) {
        console.log('//', cnn, 'doesn\'t have streets!', jct.streets);
        continue;
    }
    if (!Array.isArray(adj) || adj.length < 1) {
        console.log('//', cnn, 'doesn\'t have any adjacent intersections!', adj);
        continue;
    }
    out[cnn] = {
        ll: [jct.coords[0], jct.coords[1]],
        streets: jct.streets.sort(),
        adj: adj.sort()
    };
}

console.log('Junctions not found:', not);

console.log('export default {');
for (const cnn in out) {
    const CNN = parseInt(cnn);
    const jct = out[cnn];
    const ll = jct.ll.join(',');
    const streets = jct.streets.join("','");
    const adj = jct.adj.join(',');
    console.log(`${CNN}:{ll:[${ll}],streets:['${streets}'],adj:[${adj}]},`);
}
console.log('};');

/*

Usage:
$ node refine-junctions.js > data/junctions.js
$ view -c 'syn off' data/junctions.js

*/
