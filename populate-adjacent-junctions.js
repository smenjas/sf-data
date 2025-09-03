/**
 * @file Add adjacent street junctions.
 */

import jcts from './data/sf-junctions.js';
import jctDetails from './data/sf-streets-and-intersections.js';

/**
 * Remove trailing zeroes from a Centerline-Network Number (CNN).
 * @param {string} cnn - A Centerline-Network Number
 * @param {string} A Centerline-Network Number prefix
 */
function truncateCNN(cnn) {
    if (cnn.substring(5, 8) !== '000') {
        return cnn;
    }
    return cnn.substring(0, 5);
}

const out = {};
for (const cnn in jcts) {
    const jct = jcts[cnn];
    //if (!jct.streets.includes('WATERVILLE ST')) continue;
    jct.adj = [];
    for (const c in jctDetails) {
        const d = jctDetails[c];
        if (d.from_cnn === null || d.to_cnn === null) {
            continue;
        }
        if (d.from_cnn === cnn && d.to_cnn in jcts) {
            const to = parseInt(truncateCNN(d.to_cnn));
            if (!jct.adj.includes(to)) jct.adj.push(to);
        }
        if (d.to_cnn === cnn && d.from_cnn in jcts) {
            const fro = parseInt(truncateCNN(d.from_cnn));
            if (!jct.adj.includes(fro)) jct.adj.push(fro);
        }
    }
    if (!('coords' in jct) || !Array.isArray(jct.coords) || jct.coords.length < 2) {
        console.log(cnn, 'doesn\'t have coords!', jct.coords);
        process.exit(1);
    }
    if (!('streets' in jct) || !Array.isArray(jct.coords) || jct.coords.length < 1) {
        console.log(cnn, 'doesn\'t have streets!', jct.streets);
        process.exit(1);
    }
    if (!('adj' in jct) || !Array.isArray(jct.adj) || jct.adj.length < 1) {
        console.log(cnn, 'doesn\'t have any adjacent intersections!', jct.adj);
        process.exit(1);
    }
    out[truncateCNN(cnn)] = {
        ll: [jct.coords[0], jct.coords[1]],
        streets: jct.streets.sort(),
        adj: jct.adj.sort()
    };
}

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
