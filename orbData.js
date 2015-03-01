function generateBoardNoMatches(){
	var boardData = d3.range(config.totalCols * config.totalRows)
		.map(function(pos){return randomOrb(pos, config)});

	var matches = findMatches(boardData);
	boardData = clearMatches(matches, boardData);
	while(boardData.length < config.totalCols * config.totalRows){
		while(boardData.length < config.totalCols * config.totalRows){
			boardData = dropExistingOrbs(boardData);
			boardData = dropNewOrbs(boardData);
		}
		matches = findMatches(boardData);
		boardData = clearMatches(matches, boardData);
	}
	return boardData;
}

function generatePerturbedBoard(perturbation){
	var boardData = generatePerfectBoard();
}

function generatePerfectBoard(){
	
}

function findMatches(data){
	data = sortPosition(data);

	var orbLetters = data.map(function(d){
			return d.letter;
		});
	var orbColors = data.map(function(d){
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
			if(j <= config.totalCols - config.minWordMatchSize){
				for(var k = config.totalCols - j; k >= config.minWordMatchSize; k--){
					var word = thisRowLetters.substr(j, k);
					if(Word_List.isInList(word)){
						wordMatches.push(newMatch(i, j, 'horizontal', k, word));
						continue;
					}
				}
			}

			// vertical match, only if there's room
			var thisColLetters = letters.map(function(row){return row[j];}).join('');
			if(i <= config.totalRows - config.minWordMatchSize){
				for(k = config.totalRows - i; k >= config.minWordMatchSize; k--){
					word = thisColLetters.substr(i, k);
					if(Word_List.isInList(word)){
						wordMatches.push(newMatch(i, j, 'vertical', k, word));
						continue;
					}
				}
			}
		}
	}
	return wordMatches;
}

function matchColors(colors){
	// colors is a 2d array of the orb colors
	var colorMatches = [];

	for(var i = 0; i < config.totalRows; i++){
		for(var j = 0; j < config.totalCols; j++){
			var thisColor = colors[i][j];
			// horizontal match, only if there's room

			var colorsMatch = d3.range(config.minColorMatchSize).map(function(num){
				return colors[i].length > j+num && colors[i][j+num] === thisColor;
			})

			if(j < config.totalCols - config.minColorMatchSize + 1
				&& colorsMatch.indexOf(false) === -1){

				for(var k = j+config.minColorMatchSize; k < config.totalCols && thisColor === colors[i][k]; k++){
					// nop
				}

				colorMatches.push(newMatch(i, j, 'horizontal', k - j, thisColor));
				j = k;
			}
		}
	}

	for(j = 0; j < config.totalCols; j++){
		for(i = 0; i < config.totalRows; i++){
			thisColor = colors[i][j];

			// vertical match, only if there's room
			colorsMatch = d3.range(config.minColorMatchSize).map(function(num){
				return colors.length > i+num && colors[i + num][j] === thisColor;
			})

			if(i < config.totalRows - config.minColorMatchSize + 1
				&& colorsMatch.indexOf(false) === -1){

				for(k = i+config.minColorMatchSize; k < config.totalRows && thisColor === colors[k][j]; k++){
					// nop
				}

				colorMatches.push(newMatch(i, j, 'vertical', k - i, thisColor));
				i = k;
			}
		}
	}

	return colorMatches;
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

function newMatch(row, col, direction, orbs, value){
	// value should contain the word or the color letter.
	// no ambiguity since word matches are at least 3 characters
	return {
		row: row,
		col: col,
		direction: direction,
		orbs: orbs,
		value: value
	};
}

function scoreWord(word){
	score = 0;
	for(var i = 0; i < word.length; i++){
		score += scoreLetter(word.charAt(i));
	}
	score *= word.length * word.length;
	return score;
}

function scoreLetter(letter){
	return Math.floor(7/5 * Math.sqrt(letterFrequency['e']/letterFrequency[letter]));
}

function scoreMatches(matches){
	// only word matches have a base score. all matches increase total score by 20% of base score.
	if(matches.wordMatches.length == 0){
		return 0;
	}

	var baseScores = matches.wordMatches.map(function(match){
		return scoreWord(match.value);
	});
	var totalBaseScore = baseScores.reduce(function(a, b){
		return a + b;
	});
	return Math.round(totalBaseScore * (1 + 0.20 * (matches.wordMatches.length + matches.colorMatches.length - 1)));
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
