App.TrendLine = (function() {
	'use strict';

	var TrendLine = function(parentChart, max, min, basePoint) {
		this.trendLine = 0;
		var trend = parentChart.getChart().series.push(new am4charts.LineSeries());
		trend.dataFields.valueY = 'value';
		trend.dataFields.categoryX = 'point';
		trend.strokeWidth = 2;
		trend.stroke = am4core.color('#afab58');
		trend.data = [{ point: basePoint, value: max }, { point: basePoint, value: min }];

		this.trendLine = trend;
	};

	TrendLine.prototype.getLine = function() {
		return this.trendLine;
	};

	return TrendLine;
}());
