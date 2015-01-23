
	var config = {
		totalRows : 6,
		totalCols : 7,
		rowHeight : 50,
		colWidth : 50,
		minMatchSize: 3,
		colors: 'RGBLDW'
	};

	var initialData = d3.range(config.totalCols * config.totalRows)
		.map(function(pos){return randomOrb(pos, config)});

	var drag = d3.behavior.drag()
			.on("drag", dragmove)
			.on('dragend', dragend);

	var board = d3.select("div.game-board");

	var orbDivs = board.selectAll('div.orb');
	var orbSelection;

	updateOrbs(initialData);

	function updateOrbs(data){
		// existing orbs
		orbSelection = orbDivs.data(data);

		// new orbs
		orbSelection.enter().append("div")
			.style('left', function(d, i){
				return orbNumberCoords(d.position, config)[0] + 'px';
			})
			.style('top', function(d, i){
				return orbNumberCoords(d.position, config)[1] + 'px';
			})
			.attr("class", function(d, i) {
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
			})
			.html(function(d){
				return '<div class="letter">' + d.letter + '</div>';
			})
			.call(drag);

		orbSelection.exit().remove();
	}

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
			var displacedOrbs = orbSelection.filter(function(d,i){
				return d.position === newPosition;
			});

			var displacedOrbData = displacedOrbs.data();
			displacedOrbData[0].position = d.position;
			displacedOrbs.data(displacedOrbData);

			move(displacedOrbs[0], orbNumberCoords(d.position, config));

			var thisOrbData = d3this.data();
			thisOrbData[0].position = newPosition;
			d3this.data(thisOrbData);
		}
	}

	function dragend(d, i){
		var $this = $(this);
		$this.removeClass('moving');

		var x = parseInt($this.css('left'));
		var y = parseInt($this.css('top'));
		var nearestRowY = Math.round(y / config.rowHeight) * config.rowHeight;
		var nearestColX = Math.round(x / config.colWidth) * config.colWidth;

		move(this, [nearestColX, nearestRowY]);

		// check for matches
		var matches = findMatches(orbSelection.data());

		clearMatches(matches, orbSelection.data());
	}

	function move(element, coords){
		$(element).css('top', coords[1] + 'px')
			.css('left', coords[0] + 'px');
	}

	function findMatches(data){
		var orbs = data.sort(function(a, b){
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
		orbLetters = convertTo2d(orbLetters, config.totalCols);
		
		return {colorMatches: matchColors(orbColors), wordMatches: matchWords(orbLetters)};
	}

	function matchWords(letters){
		return null;
	}

	function matchColors(colors){
		// TODO: invert i and j?
		// colors is a nested array of the orb colors
		var colorMatches = {R:[],G:[],B:[],L:[],D:[],W:[]};

		for(var i = 0; i < config.totalRows; i++){
			for(var j = 0; j < config.totalCols; j++){
				var thisColor = colors[i][j];
				// horizontal match, only if there's room
				if(j < config.totalCols - config.minMatchSize + 1 
					&& thisColor === colors[i][j+1] && thisColor === colors[i][j+2]){
					colorMatches[thisColor].push([i,j], [i,j+1], [i,j+2]);

					for(var k = j+3; k < config.totalCols && thisColor === colors[i][k]; k++){
						colorMatches[thisColor].push([i,k]);
					}
				}

				// vertical match, only if there's room
				if(i < config.totalRows - config.minMatchSize + 1 
					&& thisColor === colors[i+1][j] && thisColor === colors[i+2][j]){
					colorMatches[thisColor].push([i,j], [i+1,j], [i+2,j]);

					for(k = i+3; k < config.totalRows && thisColor === colors[k][j]; k++){
						colorMatches[thisColor].push([k,j]);
					}
				}
			}
		}

		return colorMatches;
	}

	function clearMatches(matches, orbData){
		var colorMatches = matches.colorMatches;
		var wordMatches = matches.wordMatches;

		var orbsToRemove = [];
		for(var i = 0; i < config.colors.length; i++){
			var color = config.colors.charAt(i);
			for(var j = 0; j < colorMatches[color].length; j++){
				var orbCoords = colorMatches[color][j];
				var orbNumber = config.totalCols * orbCoords[0] + orbCoords[1]; // see matchColors TODO
				
				if(orbsToRemove.indexOf(orbNumber) === -1){
					orbsToRemove.push(orbNumber);
				}
			}
		}

		data = orbData.filter(function(d){
			return orbsToRemove.indexOf(d.position) === -1;
		});

		// TODO: make this work
		updateOrbs(data);
	}