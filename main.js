
	var config = {
		totalRows : 6,
		totalCols : 7,
		rowHeight : 50,
		colWidth : 50,
		minMatchSize: 4,
		colors: 'RGBLDW',
		maxSwaps: 20
	};

	// TODO: ensure initial board has no matches
	var initialData = d3.range(config.totalCols * config.totalRows)
		.map(function(pos){return randomOrb(pos, config)});

	var drag = d3.behavior.drag()
			.on("drag", dragmove)
			.on('dragend', dragend);

	var board = d3.select("div.game-board");

	var $results = $('div.game-results');
	var $wordResults = $('div.word-results');
	var $moveBar = $('div.move-bar');

	var orbSelection;
	enterOrbs(initialData);

	function enterOrbs(data){
		// existing orbs
		orbSelection = board.selectAll('div.orb')
			.data(data, getId);

		// new orbs
		orbSelection.enter().append("div")
			.style('left', function(d, i){
				return orbNumberCoords(d.position, config)[0] + 'px';
			})
			.style('top', function(d, i){
				return orbNumberCoords(d.position, config)[1] - 100 + 'px';
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
				return '<div class="letter"><span>' + d.letter + '</span></div>'
				+'<div class="letter-points"><span>' + scoreLetter(d.letter) + '</span></div>';
			})
			.call(drag)
			.transition(400)
			.style('top', function(d, i){
				return orbNumberCoords(d.position, config)[1] + 'px';
			})
			.style('opacity', 1);

	}

	function updateOrbs(data){
		// existing orbs
		orbSelection = board.selectAll('div.orb')
			.data(data, getId);

		orbSelection
			.transition()
			.duration(200)
			.ease('linear')
			.style('left', function(d, i){
				return orbNumberCoords(d.position, config)[0] + 'px';
			})
			.style('top', function(d, i){
				return orbNumberCoords(d.position, config)[1] + 'px';
			});

		orbSelection.exit()
			.transition()
			.duration(300)
			.style('opacity', 0)
			.style('height', '80px')
			.remove();
	}
	
	var currentSwaps = 0;
	var dragEnded = false;

	function dragmove(d, i) {
		if(currentSwaps >= config.maxSwaps){
			// update the move time bar but do nothing else
			updateMoveBar();
			return;
		}

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
			currentSwaps += 1;
			// update the move time bar
			updateMoveBar();

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
		// TODO: break this out
		var data = orbSelection.data();
		var totalMatches = {colorMatches:[], wordMatches:[]};
		var matches;

		var dropOrbsIteration = function(){
			if(data.length === config.totalRows*config.totalCols){
				displayTotalMatches(totalMatches);
				currentSwaps = 0;
				$moveBar.width('100%');

				return;
			}

			data = dropExistingOrbs(data);
			updateOrbs(data);
			data = dropNewOrbs(data);
			enterOrbs(data);
			
			// if board's not full yet
			if(data.length < config.totalRows*config.totalCols){
				setTimeout(dropOrbsIteration, 200);
			}
			else{
				setTimeout(checkMatchesIteration, 350);
			}
		}

		var checkMatchesIteration = function(){
			matches = findMatches(data);
			totalMatches.colorMatches = totalMatches.colorMatches.concat(matches.colorMatches);
			totalMatches.wordMatches = totalMatches.wordMatches.concat(matches.wordMatches);

			displayMatches(matches);
			data = clearMatches(matches, data);
			updateOrbs(data);
			setTimeout(dropOrbsIteration, 300);
		}

		checkMatchesIteration();
		dragEnded = true;
	}

	function move(element, coords){
		$(element).css('top', coords[1] + 'px')
			.css('left', coords[0] + 'px');
	}

	function updateMoveBar(){
		$moveBar.width(100*(1-currentSwaps/config.maxSwaps) + '%');
	}

	function clearMatches(matches, orbData){
		var allMatches = matches.colorMatches.concat(matches.wordMatches);

		var orbsToRemove = [];

		for(var matchNum = 0; matchNum <  allMatches.length; matchNum++){
			var thisMatch = allMatches[matchNum];
			var moreToAdd = thisMatch.orbs;
			var row = thisMatch.row;
			var col = thisMatch.col;
			for(var moreToAdd = thisMatch.orbs; moreToAdd > 0; moreToAdd--){
				orbsToRemove.push(row * config.totalCols + col);
				if(thisMatch.direction === 'horizontal'){
					col++;
				}
				else{
					row++;
				}
			}
		}

		return orbData.filter(function(d){
			return orbsToRemove.indexOf(d.position) === -1;
		});
	}


	function displayMatches(matches){
		var words = matches.wordMatches.map(function(match){return match.value;});
		var colors = matches.colorMatches.map(function(match){
			return [colorName(match.value), match.orbs]
		});
		
		for(var i = 0; i < words.length; i++){
			$wordResults.prepend('<div class="result">' + words[i]
				+ ": " + scoreWord(words[i]) + '</div>');
		}

		for(i = 0; i < colors.length; i++){
			$wordResults.prepend('<div class="result ' + colors[i][0]
				+ '">' + colors[i][0] + '</div>');
		}
	}

	function displayTotalMatches(matches){
		if(currentSwaps > 0){
			$wordResults.prepend('<div class="result">Combo: '
				+ scoreMatches(matches) + '</div>');
		}
	}

	function dropExistingOrbs(data){
		data = sortPosition(data);

		var positionsPresent = [];
		for(var i = 0; i < data.length; i++){
			positionsPresent[data[i].position] = true;
		}

		// drop existing orbs
		for(i = config.totalCols*(config.totalRows - 1) - 1; i >=0; i--){
			if(positionsPresent[i] && !positionsPresent[i + config.totalCols]){
				var fallingOrbIndex;
				var fallingOrbData = data.filter(function(d, index){

					if(d.position === i){
						fallingOrbIndex = index;
						return true;
					}
					return false;
				});

				fallingOrbData[0].position += config.totalCols;

				positionsPresent[i] = false;
				positionsPresent[i + config.totalCols] = true;
			}
		}

		return data;
	}

	function dropNewOrbs(data){
		data = sortPosition(data);
		var positionsPresent = [];
		for(var i = 0; i < data.length; i++){
			positionsPresent[data[i].position] = true;
		}

		// drop new row of orbs
		for(i = 0; i < config.totalCols; i++){
			if(!positionsPresent[i]){
				data.push(randomOrb(i, config));
			}

		}

		return data;
	}
