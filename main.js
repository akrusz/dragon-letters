(function(){
	var config = {
		totalRows : 6,
		totalCols : 7,
		rowHeight : 50,
		colWidth : 50,
		minMatchSize: 3
	};

	var drag = d3.behavior.drag()
			.on("drag", dragmove)
			.on('dragend', dragend);

	var board = d3.select("div.game-board");

	var orbDivs = board.selectAll('div')
			.data(d3.range(config.totalCols * config.totalRows).map(randomOrb));

	var orbEnter = orbDivs.enter().append("div");
	orbEnter.style('left', function(d, i){
		return orbNumberCoords(i, config)[0] + 'px';
	});
	orbEnter.style('top', function(d, i){
		return orbNumberCoords(i, config)[1] + 'px';
	});

	orbEnter.attr("class", function(d, i) {
		switch(d.color){
			case 'R':
				return 'red orb';
			case 'G':
				return 'green orb';
			case 'B':
				return 'blue orb';
			case 'L':
				return 'light orb';
			case 'D':
				return 'dark orb';
			case 'W':
				return 'white orb';
		}
	});
	orbEnter.html(function(d){
		return '<div class="letter">' + d.letter + '</div>';
	})
	orbEnter.call(drag);

	function dragmove(d, i) {
		var $this = $(this);
		$this.addClass('moving');
		
		var x = d3.event.x;
		var y = d3.event.y;

		// drag from center of orb
		var left = x - $this.width()/2;
		var top = y - $this.height()/2;
		left = limitToBounds(left, 0, config.colWidth * config.totalCols);
		top = limitToBounds(top, 0, config.rowHeight * config.totalRows);

		var newPosition = coordsOrbNumber([x,y], config);

		var d3this = d3.select(this);
		d3this.style('left', left + 'px')
				.style('top', top + 'px');

		if(newPosition !== d.position){

			// select the displaced orb element (actually just one)
			var displacedOrbs = orbEnter.filter(function(d,i){
				return d.position === newPosition;
			});

			var displacedOrbData = displacedOrbs.data();
			displacedOrbData[0].position = d.position;
			displacedOrbs.data(displacedOrbData);

			move(displacedOrbs[0], orbNumberCoords(d.position));

			var thisOrbData = d3this.data();
			thisOrbData[0].position = newPosition;
			d3this.data(thisOrbData);
		}
	};

	function dragend(d, i){
		var $this = $(this);
		$this.removeClass('moving');

		var x = parseInt($this.css('left'));
		var y = parseInt($this.css('top'));
		var nearestRowY = Math.round(y / config.rowHeight) * config.rowHeight;
		var nearestColX = Math.round(x / config.colWidth) * config.colWidth;

		move(this, [nearestColX, nearestRowY]);

		// check for matches
		findMatches();
	}

	function move(element, coords){
		$(element).css('top', coords[1] + 'px')
			.css('left', coords[0] + 'px');
	}

	function findMatches(){
		var orbs = orbEnter.data()
			.sort(function(a, b){
				return d3.ascending(a.position, b.position)
			});
		var orbLetters = orbs.map(function(d){
				return d.letter;
			});
		var orbColors = orbs.map(function(d){
				return d.color;
			});

		// convert to 2d array
		orbColors = convertTo2d(orbColors, config.totalCols);
		matchColors(orbColors);
	}

	function matchWords(letters){

	}

	function matchColors(colors){
		// colors is a nested array of the orb colors
		for(var i = 0; i < config.totalRows - config.minMatchSize; i++){
			for(var j = 0; j < config.totalCols - config.minMatchSize; j++){
				// horizontal match
				if(colors[i][j] === colors[i][j+1] && colors[i][j] === colors[i][j+2]){

				}
			}
		}
	}

	function convertTo2d(array, size){
		var newArray = [];
		while(array.length){
			newArray.push(array.splice(0, size));
		}
		return newArray;
	}

	function randomOrb(position){
		var orb = {};

		orb.letter = randomAtoZ();
		orb.position = position;
		orb.color = 'RGBLDW'[Math.floor(6 * Math.random())];
		return orb;
	}

	function randomAtoZ(){
		var lookup = {
		// Ranges calculated from data found at
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

	function orbNumberCoords(number){
		var x, y, row, col;
		row = Math.floor(number / config.totalCols);
		col = Math.floor(number % config.totalCols);
		x = col * config.colWidth;
		y = row * config.rowHeight;

		return [x, y];
	}

	function coordsOrbNumber(coords){
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
})();