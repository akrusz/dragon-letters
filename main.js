/*
 	totalRows: total rows in board
 	totalCols: total columns in board
 	rowHeight: height of row in pixels
 	colWidth: width of column in pixels
 	minColorMatchSize: the minimum number of orbs in a color match
 	minWordMatchSize: the minimum number of orbs in a word match 
 	colors: color initials of orbs to be generated. out of RGBLDW
 	movement: swap or time
	moveLimit: single, multi, or hybrid. can the player make more than one drag per turn?
	           hybrid allows this but incurs a greater cost for the first move of a drag.
 	maxSwaps: 20
 	maxTime: 5 (seconds)
*/

var config = {
	totalRows : 6,
	totalCols : 7,
	rowHeight : 50,
	colWidth : 50,
	minMatchSize: 4,
	colors: 'RGBLDW',
	movement: 'swap',
	maxSwaps: 20
};

var initialData = generateBoardNoMatches();

enterOrbs(initialData);
