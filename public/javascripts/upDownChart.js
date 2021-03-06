App.UpDownChart = (function() {
	'use strict';

	var UpDownChart = function(containerId, priceData, position) {
		this.basePointValue = 0;
		this.position = position;

		this.chart = am4core.create(containerId, am4charts.XYChart);
		this.chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect
		this.chart.data = this.generateData(priceData);
		this.chart.responsive.enabled = false;
		this.chart.paddingLeft = 0;
		this.chart.paddingRight = 0;
		this.chart.paddingTop = 1;
		this.chart.paddingBottom = 1;

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

		if (this.position === 'left') {
			this.valueAxis.min = priceData.startMinPrice;
			this.valueAxis.max = priceData.startMaxPrice;
		} else {
			this.valueAxis.min = priceData.openMinPrice;
			this.valueAxis.max = priceData.openMaxPrice;
		}

		this.series = this.chart.series.push(new am4charts.ColumnSeries());
		this.series.dataFields.categoryX = 'base';
		this.series.dataFields.valueY = 'value';
		this.series.dataFields.openValueY = 'baseValue';
		this.series.fixedWidthGrid = true;
		this.series.columns.template.propertyFields.fill = 'color';
		this.series.columns.template.propertyFields.stroke = 'color';
		this.series.columns.template.width = am4core.percent(100);

		this.series.columns.template.events.on('validated', function(ev) {
			ev.target.fill = am4core.color(this.chart.data[0].color);
			ev.target.stroke = am4core.color(this.chart.data[0].color);
			App.main.updateSideChartMinMaxValue();
		}.bind(this));
	};

	UpDownChart.prototype.generateData = function(priceData) {
		var value, baseValue;

		if (this.position === 'left') {
			baseValue = priceData.startBaseValue;
			if (priceData.avgPriceList.length <= App.main.getBasePoint()) {
				value = priceData.avgPrice;
			} else {
				value = priceData.avgPriceList[App.main.getBasePoint()];
			}
		} else {
			baseValue = priceData.resultBaseValue;
			value = priceData.avgPrice;
		}

		console.log('base value', baseValue);
		console.log('value', value);

		return [{
			base: 'One',
			value: value,
			baseValue: baseValue,
			color: (value > baseValue ? App.COLOR.UP : App.COLOR.DOWN),
		}];
	};

	UpDownChart.prototype.setBasePointValue = function(basePointValue) {
		if (this.basePointValue <= 0) {
			this.basePointValue = basePointValue;
		}
	};

	UpDownChart.prototype.updateData = function(priceData) {
		this.chart.data[0].value = priceData.avgPrice;
		// this.chart.data[0].baseValue = this.basePointValue;
		if (priceData.avgPrice >= this.chart.data[0].baseValue) {
			this.chart.data[0].color = App.COLOR.UP;
		} else {
			this.chart.data[0].color = App.COLOR.DOWN;
		}

		this.chart.invalidateRawData();
	};

	UpDownChart.prototype.updateMaxValue = function(maxValue) {
		this.valueAxis.max = maxValue;
	};

	UpDownChart.prototype.updateMinValue = function(minValue) {
		this.valueAxis.min = minValue;
	};

	UpDownChart.prototype.getChart = function() {
		return this.chart;
	};

	return UpDownChart;
}());
