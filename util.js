
function convertTo2d(array, size){
	var newArray = [];
	while(array.length){
		newArray.push(array.splice(0, size));
	}
	return newArray;
}

function randomOrb(position, config){
	var orb = {};

	orb.letter = randomAtoZ();
	orb.position = position;
	orb.color = config.colors[Math.floor(config.colors.length * Math.random())];
	return orb;
}

function randomAtoZ(){
	var lookup = {
	// Ranges modified from data found at
	// http://www.oxforddictionaries.com/us/words/what-is-the-frequency-of-the-letters-of-the-alphabet-in-english
	e: 57, a: 100, r: 139, i: 177, o: 214, t: 249, n: 283, l: 301, c: 323,
	u: 342, d: 359, p: 375, m: 390, h: 405, g: 418, b: 429, f: 438,
	y: 447, w: 454, k: 460, v: 465, x: 468, z: 471, j: 473, q: 475};
	var random = Math.random() * 475,
			letter;
	for (letter in lookup) {
		if (random < lookup[letter]) {
			return letter;
		}
	}
}

function orbNumberCoords(number, config){
	var x, y, row, col;
	row = Math.floor(number / config.totalCols);
	col = Math.floor(number % config.totalCols);
	x = col * config.colWidth;
	y = row * config.rowHeight;

	return [x, y];
}

function coordsOrbNumber(coords, config){
	var x = coords[0];
	var y = coords[1];
	var row = limitToBounds(Math.floor(y / config.rowHeight), 0, config.totalRows - 1);
	var col = limitToBounds(Math.floor(x / config.colWidth), 0, config.totalCols - 1);

	return row * config.totalCols + col;
}

function limitToBounds(value, min, max){
	return value < min
		? min
		: value > max
			? max
			: value;
}

function getPosition(d){
	return d.position;
}