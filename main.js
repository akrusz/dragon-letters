
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

	var $results = $('div.game-results');
	var $wordResults = $('div.word-results');


	var orbSelection;

	updateOrbs(initialData);

	function updateOrbs(data){
		// existing orbs
		orbSelection = board.selectAll('div.orb')
			.data(data, getPosition);

		// new orbs
		orbSelection.enter().append("div")
			.style('left', function(d, i){
				return orbNumberCoords(d.position, config)[0] + 'px';
			})
			.style('top', function(d, i){
				return orbNumberCoords(d.position, config)[1] - 300 + 'px';
			})
			.style('opacity', 0)
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
			.call(drag)
			.transition()
			.style('top', function(d, i){
				return orbNumberCoords(d.position, config)[1] + 'px';
			})
			.style('opacity', 1);

		orbSelection.exit()
			.transition()
			.duration(200)
			.style('opacity', 0)
			.remove();
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

		var newPosition = xyOrbNumber([x,y], config);

		var d3this = d3.select(this);
		d3this.style('left', left + 'px')
				.style('top', top + 'px');

		if(newPosition !== d.position){
			// select the displaced orb element (actually just one)
			var displacedOrbs = orbSelection.filter(function(d,i){
				return d.position === newPosition;
			});

			var displacedOrbData = displacedOrbs.datum();
			displacedOrbData.position = d.position;
			displacedOrbs.datum(displacedOrbData);

			move(displacedOrbs[0], orbNumberCoords(d.position, config));

			var thisOrbData = d3this.datum();
			thisOrbData.position = newPosition;
			d3this.datum(thisOrbData);
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
		displayMatches(matches);
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
		var wordMatches = [];

		for(var i = 0; i < config.totalRows; i++){
			var thisRowLetters = letters[i].join('');
			for(var j = 0; j < config.totalCols; j++){
				// horizontal match, only if there's room
				if(j < config.totalCols - config.minMatchSize){
					for(var k = config.totalCols - j; k >= config.minMatchSize; k--){
						var word = thisRowLetters.substr(j, k);
						if(Word_List.isInList(word)){
							wordMatches.push([i,j,k,word]);
							continue;
						}
					}
				}

				// vertical match, only if there's room
				var thisColLetters = letters.map(function(row){return row[j];}).join('');
				if(i < config.totalRows - config.minMatchSize){
					for(k = config.totalRows - i; k >= config.minMatchSize; k--){
						word = thisColLetters.substr(i, k);
						if(Word_List.isInList(word)){
							wordMatches.push([i,j,k,word]);
							continue;
						}
					}
				}
			}
		}
		return wordMatches;
	}

	function scoreWord(word){
		score = 0;
		for(var i = 0; i < word.length; i++){
			score += Math.floor(7/5 * Math.sqrt(letterFrequency['e']/letterFrequency[word.charAt(i)]));
		}
		score *= word.length * word.length;
		return score;
	}

	function scoreMatches(matches){

	}

	function displayMatches(matches){
		var words = matches.wordMatches.map(function(match){return match[3];});
		for(var i = 0; i < words.length; i++){
			$wordResults.prepend('<div class="word-result">' + words[i]
				+ ": " + scoreWord(words[i]) + '</div>');
		}

	}

	function matchColors(colors){
		// TODO: invert i and j?
		// colors is a nested array of the orb colors
		// var colorMatches = {R:[],G:[],B:[],L:[],D:[],W:[]};
		var colorMatches = [];

		for(var i = 0; i < config.totalRows; i++){
			for(var j = 0; j < config.totalCols; j++){
				var thisColor = colors[i][j];
				// horizontal match, only if there's room
				if(j < config.totalCols - config.minMatchSize + 1 
					&& thisColor === colors[i][j+1] && thisColor === colors[i][j+2]){

					for(var k = j+3; k < config.totalCols && thisColor === colors[i][k]; k++){
						//nop
					}

					colorMatches.push(newMatch(i, j, 'horizontal', k - j, thisColor));
				}

				// vertical match, only if there's room
				if(i < config.totalRows - config.minMatchSize + 1 
					&& thisColor === colors[i+1][j] && thisColor === colors[i+2][j]){

					for(k = i+3; k < config.totalRows && thisColor === colors[k][j]; k++){
						// nop
					}

					colorMatches.push(newMatch(i, j, 'vertical', k - i, thisColor));
				}
			}
		}

		return colorMatches;
	}

	function newMatch(row, col, direction, orbs, value){
		return {
			row: row,
			col: col,
			direction: direction,
			orbs: orbs,
			value: value
		};
	}

	function clearMatches(matches, orbData){
		var colorMatches = matches.colorMatches;
		var wordMatches = matches.wordMatches;

		var orbsToRemove = [];

		for(matchNum = 0; matchNum <  colorMatches.length; matchNum++){
			var colorMatch = colorMatches[matchNum];
			var moreToAdd = colorMatch.orbs;
			var row = colorMatch.row;
			var col = colorMatch.col;
			for(var moreToAdd = colorMatch.orbs; moreToAdd > 0; moreToAdd--){
				orbsToRemove.push(row * config.totalCols + col);
				if(colorMatch.direction === 'horizontal'){
					col++;
				}
				else{
					row++;
				}
			}
		}

		data = orbData.filter(function(d){
			return orbsToRemove.indexOf(d.position) === -1;
		});

		// TODO: make this work
		updateOrbs(data);
	}