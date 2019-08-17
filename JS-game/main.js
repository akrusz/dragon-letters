var config = {
	totalRows : 6,
	totalCols : 7,
	rowHeight : 50,
	colWidth : 50,
	minColorMatchSize: 4,
	minWordMatchSize: 4,
	colors: 'RGBLDW',
	movement: 'swap',
	maxSwaps: 20
};

var initialData = generateBoardNoMatches();

enterOrbs(initialData);
