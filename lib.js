/**
 * @module lib
 */

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
export function distill(num, start) {
    return parseInt(num.toString().substring(start));
}

/**
 * Round a decimal number to a given precision.
 *
 * @param {number} num - The number to round
 * @param {number} precision - How many decimal places to keep
 * @returns {number} The rounded number
 */
export function round(num, precision) {
    const factor = 10 ** precision;
    return Math.round(num * factor) / factor;
}
