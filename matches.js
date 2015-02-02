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
			if(j <= config.totalCols - config.minMatchSize){
				for(var k = config.totalCols - j; k >= config.minMatchSize; k--){
					var word = thisRowLetters.substr(j, k);
					if(Word_List.isInList(word)){
						wordMatches.push(newMatch(i, j, 'horizontal', k, word));
						continue;
					}
				}
			}

			// vertical match, only if there's room
			var thisColLetters = letters.map(function(row){return row[j];}).join('');
			if(i <= config.totalRows - config.minMatchSize){
				for(k = config.totalRows - i; k >= config.minMatchSize; k--){
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

			var colorsMatch = d3.range(config.minMatchSize).map(function(num){
				return colors[i].length > j+num && colors[i][j+num] === thisColor;
			})

			if(j < config.totalCols - config.minMatchSize + 1
				&& colorsMatch.indexOf(false) === -1){

				for(var k = j+config.minMatchSize; k < config.totalCols && thisColor === colors[i][k]; k++){
					//nop
				}

				colorMatches.push(newMatch(i, j, 'horizontal', k - j, thisColor));
			}

			// vertical match, only if there's room
			colorsMatch = d3.range(config.minMatchSize).map(function(num){
				return colors.length > i+num && colors[i + num][j] === thisColor;
			})

			if(i < config.totalRows - config.minMatchSize + 1
				&& colorsMatch.indexOf(false) === -1){

				for(k = i+config.minMatchSize; k < config.totalRows && thisColor === colors[k][j]; k++){
					// nop
				}

				colorMatches.push(newMatch(i, j, 'vertical', k - i, thisColor));
			}
		}
	}

	return colorMatches;
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