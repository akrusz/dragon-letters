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



function displayMatches(matches){
	var words = matches.wordMatches.map(function(match){return match.value;});
	for(var i = 0; i < words.length; i++){
		$wordResults.prepend('<div class="word-result">' + words[i]
			+ ": " + scoreWord(words[i]) + '</div>');
	}

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
	return {
		row: row,
		col: col,
		direction: direction,
		orbs: orbs,
		value: value
	};
}