App.MainChart = (function() {
	'use strict';

	function MainChart(containerId, priceData) {
		this.baseValue = 0;

		this.mainChart = this.makeChart(containerId, priceData);
		this.makeCategoryAxis();
		this.valueAxis = this.makeValueAxis();
		this.makeMaxSeries();
		this.makeMinSeries();
		this.baseValueLine = this.makeBaseSeries();
		this.makeBasePoint();
		this.bullet = this.makeBullet();
		this.baseLine = this.makeBaseLine(priceData);
		this.setupEvent();
	}

	MainChart.prototype.addData = function(rawDataItem, removeCount) {
		this.mainChart.addData(rawDataItem, removeCount);
		this.invalidateRawData();
	};

	MainChart.prototype.invalidateRawData = function() {
		this.mainChart.invalidateRawData();
	};

	MainChart.prototype.getChart = function() {
		return this.mainChart;
	};

	MainChart.prototype.getMaxValue = function() {
		return this.valueAxis.max;
	};
	MainChart.prototype.getMinValue = function() {
		return this.valueAxis.min;
	};

	MainChart.prototype.makeChart = function(containerId, priceData) {
		var chart = am4core.create(containerId, am4charts.XYChart);
		chart.paddingLeft = 0;
		chart.paddingRight = 0;
		chart.paddingTop = 1;
		chart.paddingBottom = 1;
		chart.language.locale = am4lang_ko_KR;

		chart.data = this.generateData(priceData);
		return chart;
	};

	MainChart.prototype.generateData = function(priceData) {
		var result = [];
		for (var i = 0; i < 120; i++) {
			result.push({
				point: i,
				avgValue: i === 0 ? priceData.avgPrice : undefined,
				maxValue: i === 0 ? priceData.maxValue : undefined,
				minValue: i === 0 ? priceData.minValue : undefined,
				townSize: 0,
				startBaseTime: i,
				endBaseTime: i,
				startBaseValue: null,
				endBaseValue: null,
			});
		}
		return result;
	};

	MainChart.prototype.makeCategoryAxis = function() {
		var categoryAxis = this.mainChart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.dataFields.category = 'point';
		categoryAxis.renderer.minGridDistance = 10;
		categoryAxis.tooltip.disabled = true;
		categoryAxis.renderer.grid.template.disabled = true;
		categoryAxis.renderer.inside = true;
		categoryAxis.renderer.labels.template.disabled = true;

		categoryAxis.renderer.grid.template.location = 0.5;
		categoryAxis.startLocation = 0.5;
		categoryAxis.endLocation = 0.5;
		return categoryAxis;
	};

	MainChart.prototype.makeValueAxis = function() {
		var valueAxis = this.mainChart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.renderer.inside = true;
		valueAxis.renderer.labels.template.disabled = true;
		valueAxis.renderer.grid.template.disabled = true;
		valueAxis.cursorTooltipEnabled = false;
		valueAxis.strictMinMax = true;
		return valueAxis;
	};

	MainChart.prototype.makeMaxSeries = function() {
		var series = this.mainChart.series.push(new am4charts.LineSeries());
		series.dataFields.categoryX = 'point';
		series.dataFields.valueY = 'binValue';
		series.strokeWidth = 1;
		series.stroke = am4core.color('#66363a');
		series.strokeOpacity = 0.3;
		series.tensionX = 0.8;
		series.connect = false;
		return series;
	};

	MainChart.prototype.makeMinSeries = function() {
		var series = this.mainChart.series.push(new am4charts.LineSeries());
		series.dataFields.categoryX = 'point';
		series.dataFields.valueY = 'idxValue';
		series.strokeWidth = 1;
		series.stroke = am4core.color('#2a4f66');
		series.strokeOpacity = 0.3;
		series.tensionX = 0.8;
		series.connect = false;
		return series;
	};

	MainChart.prototype.makeBaseSeries = function() {
		var series = this.mainChart.series.push(new am4charts.LineSeries());
		series.dataFields.categoryX = 'point';
		series.dataFields.valueY = 'avgValue';
		series.strokeWidth = 2;
		series.tensionX = 0.8;
		series.connect = false;
		series.stroke = am4core.color('#ffd524');
		return series;
	};

	MainChart.prototype.makeBasePoint = function() {
		var bullet = this.baseValueLine.bullets.push(new am4charts.CircleBullet());
		bullet.circle.fill = am4core.color('#ffd524');
		bullet.circle.strokeWidth = 2;
		bullet.circle.propertyFields.radius = 'townSize';
		return bullet;
	};

	MainChart.prototype.makeBullet = function() {
		var bullet = this.baseValueLine.createChild(am4charts.CircleBullet);
		bullet.circle.radius = 7;
		bullet.fillOpacity = 1;
		bullet.fill = am4core.color('#ffd524');
		bullet.strokeOpacity = 1;
		bullet.isMeasured = false;
		return bullet;
	};

	MainChart.prototype.setupEvent = function() {
		this.baseValueLine.events.on('validated', function() {
			this.baseLine.data[0].value = this.valueAxis.max;
			this.baseLine.data[1].value = this.valueAxis.min;
			this.baseLine.invalidateRawData();

			if (this.baseValueLine.dataItems.last.valueY) {
				this.bullet.moveTo(this.baseValueLine.dataItems.last.point);
				this.bullet.validatePosition();
			}
		}.bind(this));
	};

	MainChart.prototype.makeBaseLine = function(priceData) {
		var trend = this.mainChart.series.push(new am4charts.LineSeries());
		trend.dataFields.valueY = 'value';
		trend.dataFields.categoryX = 'point';
		trend.strokeWidth = 1;
		trend.strokeOpacity = 1;
		trend.stroke = am4core.color('#79838d');
		trend.data = [{
			point: App.main.getBasePoint(), value: priceData.maxPrice,
		}, {
			point: App.main.getBasePoint(), value: priceData.minPrice,
		}];
		trend.defaultState.transitionDuration = 0;
		trend.interpolationDuration = 0;
		return trend;
	};

	MainChart.prototype.makeResultLine = function(baseValue) {
		var resultBaseLine = this.mainChart.series.push(new am4charts.LineSeries());
		resultBaseLine.dataFields.valueY = 'value';
		resultBaseLine.dataFields.categoryX = 'point';
		resultBaseLine.strokeWidth = 1;
		resultBaseLine.strokeOpacity = 1;
		resultBaseLine.stroke = am4core.color('#79838d');
		resultBaseLine.data = [
			{ point: App.main.getBasePoint(), value: baseValue },
			{ point: App.main.getEndPoint(), value: baseValue },
		];

		var resultDynamicLine = this.mainChart.series.push(new am4charts.LineSeries());
		resultDynamicLine.dataFields.valueY = 'value';
		resultDynamicLine.dataFields.categoryX = 'point';
		resultDynamicLine.dataFields.openValueY = 'baseValue';
		resultDynamicLine.fillOpacity = 0.1;
		resultDynamicLine.propertyFields.fill = 'color';
		resultDynamicLine.propertyFields.stroke = 'color';
		resultDynamicLine.strokeWidth = 1;
		resultDynamicLine.strokeOpacity = 0.1;
		resultDynamicLine.data = [
			{ point: App.main.getBasePoint(), value: baseValue, baseValue: baseValue, color: App.COLOR.DOWN },
			{ point: App.main.getEndPoint(), value: baseValue, baseValue: baseValue, color: App.COLOR.DOWN },
		];

		this.resultLine = resultDynamicLine;
	};

	MainChart.prototype.updateResultLineData = function(value, basePointValue) {
		this.resultLine.data[0].value = value;
		this.resultLine.data[1].value = value;
		if (value >= basePointValue) {
			this.resultLine.data[0].color = App.COLOR.UP;
			this.resultLine.data[1].color = App.COLOR.UP;
		} else {
			this.resultLine.data[0].color = App.COLOR.DOWN;
			this.resultLine.data[1].color = App.COLOR.DOWN;
		}

		this.resultLine.invalidateRawData();
	};

	return MainChart;
}());
