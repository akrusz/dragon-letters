
function convertTo2d(array, size){
	var newArray = [];
	while(array.length){
		newArray.push(array.splice(0, size));
	}
	return newArray;
}

var orbsCreated = 0;

function randomOrb(position, config){
	var orb = {};

	orb.letter = randomAtoZ();
	orb.position = position;
	orb.color = config.colors[Math.floor(config.colors.length * Math.random())];
	orb.id = orbsCreated;
	orbsCreated += 1;
	return orb;
}

function randomAtoZ(){
	var sumFrequencies = {};
	var runningTotal = 0;
	for(var letter in letterFrequency){
		runningTotal += letterFrequency[letter];
		sumFrequencies[letter] = runningTotal;
	}
	// Ranges modified from data found at
	// http://www.oxforddictionaries.com/us/words/what-is-the-frequency-of-the-letters-of-the-alphabet-in-english

	var random = Math.random() * runningTotal;
	for (letter in letterFrequency) {
		if (random < sumFrequencies[letter]) {
			return letter;
		}
	}
}

var letterFrequency = {
	e: 57, a: 43, r: 39, i: 38, o: 37, t: 35, n: 34, s: 29, l: 28, c: 23,
	u: 19, d: 17, p: 16, m: 15, h: 15, g: 13, b: 11, f: 9, y: 9, w: 7,
	k: 6, v: 5, x: 3, z: 3, j: 2, q: 2
};

function orbNumberCoords(number, config){
	var x, y, row, col;
	row = Math.floor(number / config.totalCols);
	col = Math.floor(number % config.totalCols);
	x = col * config.colWidth;
	y = row * config.rowHeight;

	return [x, y];
}

function xyOrbNumber(coords, config){
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

function getId(d){
	return d.id;
}

function sortPosition(data) {
	return data.sort(function(a, b){
			return d3.ascending(a.position, b.position)
		});
}
