/* eslint-disable max-len */
/**
 *
 * @param {Object} config
 * @return {String}
 */
export function getTagIcon(config) {
  return `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="${config.width}px" height="${config.height}px" viewBox="0 0 533.333 533.333">
    <g>
    <path d="M483.236,0H332.943c-27.556,0-66.04,15.94-85.523,35.424L14.612,268.231c-19.483,19.483-19.483,51.367,0,70.85 L194.253,518.72c19.483,19.484,51.365,19.484,70.849,0L497.91,285.913c19.483-19.484,35.424-57.969,35.424-85.522V50.098 C533.333,22.544,510.79,0,483.236,0zM416.667,166.667c-27.614,0-50-22.385-50-50c0-27.614,22.386-50,50-50s50,22.386,50,50 C466.667,144.281,444.281,166.667,416.667,166.667z"/>
    </g></svg>`;
}

/**
 *
 * @param {Object} config
 * @return {String}
 */
export function getPlusIcon(config) {
  return `<svg aria-hidden="true" class="octicon octicon-plus float-left" width="${config.width}px" height="${config.height}px" version="1.1" viewBox="0 0 12 16"><path fill-rule="evenodd" d="M12 9H7v5H5V9H0V7h5V2h2v5h5z"></path></svg>`;
}

/**
 *
 * @param {Object} config
 * @return {String}
 */
export function getJsonIcon(config) {
  return `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="${config.width}px" height="${config.height}px" viewBox="0 0 16 16">
<path fill="#444444" d="M2.1 3.1c0.2 1.3 0.4 1.6 0.4 2.9 0 0.8-1.5 1.5-1.5 1.5v1c0 0 1.5 0.7 1.5 1.5 0 1.3-0.2 1.6-0.4 2.9-0.3 2.1 0.8 3.1 1.8 3.1s2.1 0 2.1 0v-2c0 0-1.8 0.2-1.8-1 0-0.9 0.2-0.9 0.4-2.9 0.1-0.9-0.5-1.6-1.1-2.1 0.6-0.5 1.2-1.1 1.1-2-0.3-2-0.4-2-0.4-2.9 0-1.2 1.8-1.1 1.8-1.1v-2c0 0-1 0-2.1 0s-2.1 1-1.8 3.1z"></path><path fill="#444444" d="M13.9 3.1c-0.2 1.3-0.4 1.6-0.4 2.9 0 0.8 1.5 1.5 1.5 1.5v1c0 0-1.5 0.7-1.5 1.5 0 1.3 0.2 1.6 0.4 2.9 0.3 2.1-0.8 3.1-1.8 3.1s-2.1 0-2.1 0v-2c0 0 1.8 0.2 1.8-1 0-0.9-0.2-0.9-0.4-2.9-0.1-0.9 0.5-1.6 1.1-2.1-0.6-0.5-1.2-1.1-1.1-2 0.2-2 0.4-2 0.4-2.9 0-1.2-1.8-1.1-1.8-1.1v-2c0 0 1 0 2.1 0s2.1 1 1.8 3.1z"></path>
</svg>`;
}

/**
 *
 * @param {Object} config
 * @return {String}
 */
export function getStarIcon(config) {
  return `<svg aria-hidden="true" class="octicon octicon-star" width="${config.width}px" height="${config.height}px" version="1.1" viewBox="0 0 14 16"><path fill-rule="evenodd" d="M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74z"></path></svg>`;
}

/**
 *
 * @param {Object} config
 * @return {String}
 */
export function getCloseIcon(config) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="${config.width}px" height="${config.height}px" viewBox="0 0 612 612" style="enable-background:new 0 0 612 612;">
<g>
	<g id="cross">
		<g>
			<polygon points="612,36.004 576.521,0.603 306,270.608 35.478,0.603 0,36.004 270.522,306.011 0,575.997 35.478,611.397 
				306,341.411 576.521,611.397 612,575.997 341.459,306.011"/>
		</g>
	</g>
</g>
</svg>`;
}

/**
 *
 * @param {Object} config
 * @return {String}
 */
export function getTrashcan(config) {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${config.width}px" height="${config.height}px" viewBox="0 0 753.23 753.23"><path d="M494.308 659.077c12.993 0 23.538-10.546 23.538-23.54v-282.46c0-12.993-10.545-23.54-23.538-23.54s-23.538 10.546-23.538 23.54v282.46c0 12.994 10.544 23.54 23.538 23.54zm141.23-564.923h-141.23V47.077C494.308 21.067 473.24 0 447.23 0H306c-26.01 0-47.077 21.067-47.077 47.077v47.077h-141.23c-26.01 0-47.077 21.067-47.077 47.077v47.078c0 25.986 21.067 47.077 47.077 47.077v423.692c0 51.996 42.157 94.153 94.154 94.153h329.54c51.995 0 94.152-42.157 94.152-94.153V235.385c26.01 0 47.076-21.09 47.076-47.077V141.23c0-26.01-21.068-47.076-47.078-47.076zM306 70.614c0-12.992 10.545-23.538 23.538-23.538h94.154c12.993 0 23.538 10.545 23.538 23.54v23.538H306v-23.54zm282.46 588.463c0 25.986-21.065 47.076-47.075 47.076h-329.54c-26.01 0-47.076-21.09-47.076-47.076V235.385h423.69v423.692zM612 188.307H141.23c-12.993 0-23.538-10.544-23.538-23.538s10.545-23.54 23.538-23.54H612c12.993 0 23.538 10.545 23.538 23.54S624.993 188.307 612 188.307zm-353.077 470.77c12.993 0 23.54-10.546 23.54-23.54v-282.46c0-12.993-10.546-23.54-23.54-23.54s-23.54 10.546-23.54 23.54v282.46c0 12.994 10.547 23.54 23.54 23.54zm117.692 0c12.993 0 23.538-10.546 23.538-23.54v-282.46c0-12.993-10.545-23.54-23.538-23.54s-23.54 10.546-23.54 23.54v282.46c.002 12.994 10.547 23.54 23.54 23.54z"/></svg>
`;
}
/* eslint-enable max-len */
