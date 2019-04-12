App.UpDownChart = (function() {
	'use strict';

	var UpDownChart = function(containerId, initDataData, max, min) {
		this.valueAxis = undefined;
		this.chart = undefined;
		this.basePointValue = 0;

		this.chart = am4core.create(containerId, am4charts.XYChart);
		this.chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect
		this.chart.data = initDataData;
		this.chart.responsive.enabled = false;
		this.chart.paddingLeft = 0;
		this.chart.paddingRight = 0;

		var categoryAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.renderer.grid.template.location = 0;
		categoryAxis.renderer.grid.template.disabled = true;
		categoryAxis.renderer.inside = true;
		categoryAxis.dataFields.category = 'base';
		categoryAxis.renderer.minGridDistance = 5;
		categoryAxis.hidden = true;

		this.valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
		this.valueAxis.renderer.labels.template.disabled = true;
		this.valueAxis.renderer.grid.template.disabled = true;
		this.valueAxis.renderer.inside = true;
		this.valueAxis.cursorTooltipEnabled = false;
		this.valueAxis.strictMinMax = true;

		this.valueAxis.min = min;
		this.valueAxis.max = max;

		this.rightSeries = this.chart.series.push(new am4charts.ColumnSeries());
		this.rightSeries.dataFields.categoryX = 'base';
		this.rightSeries.dataFields.valueY = 'value';
		this.rightSeries.dataFields.openValueY = 'baseValue';
		this.rightSeries.fixedWidthGrid = true;
		this.rightSeries.columns.template.propertyFields.fill = 'color';
		this.rightSeries.columns.template.propertyFields.stroke = 'color';
		this.rightSeries.columns.template.width = am4core.percent(100);

		this.rightSeries.columns.template.events.on('validated', function(ev) {
			ev.target.fill = am4core.color(this.chart.data[0].color);
			ev.target.stroke = am4core.color(this.chart.data[0].color);
			this.valueAxis.min = min;
			this.valueAxis.max = max;
		}.bind(this));
	};

	UpDownChart.prototype.setBasePointValue = function(basePointValue) {
		if (this.basePointValue <= 0) {
			this.basePointValue = basePointValue;
		}
	};

	UpDownChart.prototype.updateData = function(data) {
		this.chart.data[0].value = data.avgPrice;
		this.chart.data[0].baseValue = this.basePointValue;
		if (data.avgPrice >= this.basePointValue) {
			this.chart.data[0].color = App.COLOR.UP;
		} else {
			this.chart.data[0].color = App.COLOR.DOWN;
		}

		this.chart.invalidateRawData();
	};

	return UpDownChart;
}());