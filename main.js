
var config = {
	totalRows : 6,
	totalCols : 7,
	rowHeight : 50,
	colWidth : 50,
	minMatchSize: 4,
	colors: 'RGBLDW',
	maxSwaps: 20
};

var initialData = generateBoardNoMatches();

enterOrbs(initialData);
