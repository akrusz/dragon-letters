var drag = d3.behavior.drag()
		.on('dragstart', dragstart)
		.on("drag", dragmove)
		.on('dragend', endMove);

var board = d3.select("div.game-board");

var $results = $('div.game-results');
var $wordResults = $('div.word-results');
var d3MoveBar = d3.select('div.move-bar');
var $moveBar = $('div.move-bar');

var isAnimating = false;
var isDragging = false;
var $overlay = $('div.overlay');
$overlay.click(function(event){
	event.stopPropagation();
});
var loadingMessage = d3.select('div.loading-message');
loadingMessage.transition()
		.style('top', '200px')
		.style('opacity', 0);

var orbSelection;

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
		.remove();
}

var currentSwaps = 0;
var dragEnded = false;

function dragstart(d, i){
	isDragging = true;
}

function dragmove(d, i){
	if(isAnimating){
		return;
	}

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
	left = limitToBounds(left, 0, config.colWidth * (config.totalCols - 1));
	top = limitToBounds(top, 0, config.rowHeight * (config.totalRows - 1));

	var newPosition = xyOrbNumber([x,y], config);

	var d3this = d3.select(this);
	d3this.style('left', left + 'px')
			.style('top', top + 'px');

	if(newPosition !== d.position){
		currentSwaps += 1;
		isDragging = true;
		// update the move time bar
		updateMoveBar();

		// select the displaced orb element (actually just one)
		var displacedOrbs = orbSelection.filter(function(d,i){
			return d.position === newPosition;
		});

		var displacedOrbData = displacedOrbs.datum();
		displacedOrbData.position = d.position;
		displacedOrbs.datum(displacedOrbData);

		slide(displacedOrbs, orbNumberCoords(d.position, config));

		var thisOrbData = d3this.datum();
		thisOrbData.position = newPosition;
		d3this.datum(thisOrbData);

		if(currentSwaps === config.maxSwaps){
			endMove(d, i, this);
			isDragging = false;
		}
	}
}

function endMove(d, i, orb){
	if(!isDragging){
		return;
	}

	// need to have an element to operate on.
	// orb may be null if user still dragging from prev turn
	var thisElement = orb || this;
	var $this = $(thisElement);
	var d3this = d3.select(thisElement);
	$this.removeClass('moving');

	var x = parseInt($this.css('left'));
	var y = parseInt($this.css('top'));
	var nearestRowY = Math.round(y / config.rowHeight) * config.rowHeight;
	var nearestColX = Math.round(x / config.colWidth) * config.colWidth;

	slide(d3this, [nearestColX, nearestRowY]);

	// check for matches
	// TODO: break this out
	var data = orbSelection.data();
	var totalMatches = {colorMatches:[], wordMatches:[]};
	var matches;

	var dropOrbsIteration = function(){
		if(data.length === config.totalRows*config.totalCols){
			displayTotalMatches(totalMatches);
			currentSwaps = 0;
			updateMoveBar();
			isAnimating = false;
			$overlay.addClass('hidden');
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

		isAnimating = true;
		$overlay.removeClass('hidden');

		displayMatches(matches);
		data = clearMatches(matches, data);
		updateOrbs(data);
		setTimeout(dropOrbsIteration, 300);
	}

	checkMatchesIteration();
	dragEnded = true;
}

function slide(d3element, coords){
	d3element
		.transition()
		.duration(100)
		.style('left', coords[0] + 'px')
		.style('top', coords[1] + 'px');
}

var redGreenInterpolator = d3.interpolate('#DD4422', '#44DD88');

function updateMoveBar(){
	var moveRemaining = 1-currentSwaps/config.maxSwaps;
	d3MoveBar
		.transition()
		.duration(100)
		.style('background-color', redGreenInterpolator(moveRemaining))
		.style('width', moveRemaining * $moveBar.parent().width() + 'px');
}

function displayMatches(matches){
	var words = matches.wordMatches.map(function(match){return match.value;});
	var colors = matches.colorMatches.map(function(match){
		return [colorName(match.value), match.orbs]
	});

	for(var i = 0; i < words.length; i++){
		$wordResults.prepend('<div class="result word-result">' + words[i]
			+ ": " + scoreWord(words[i]) + '</div>');
	}

	for(i = 0; i < colors.length; i++){
		$wordResults.prepend('<div class="result ' + colors[i][0]
			+ '">' + colors[i][0] + '</div>');
	}
}

function displayTotalMatches(matches){
	if(currentSwaps > 0){
		$wordResults.prepend('<div class="result">' +
			(matches.colorMatches.length + matches.wordMatches.length) + ' combo: '
			+ scoreMatches(matches) + '</div>');
	}
}
