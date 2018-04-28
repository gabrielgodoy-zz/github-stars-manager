export let $ = (selector) => document.querySelector(selector);

/**
 * @param {String} str
 * @return {String}
 */
export function upperCaseFirst(str) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}
