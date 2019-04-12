App.MainChart = (function() {
	'use strict';

	function MainChart(containerId, priceData) {
		this.leftBaseValue = 0;
		this.baseValue = 0;

		this.mainChart = this.makeChart(containerId, priceData);
		this.makeCategoryAxis();
		this.valueAxis = this.makeValueAxis();
		this.makeMaxSeries();
		this.makeMinSeries();
		this.baseValueLine = this.makeBaseSeries();
		this.resultValueLine = this.makeResultSeries();
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

	MainChart.prototype.updateResultLineData = function(value, basePointValue) {
		console.log(this.resultLine);
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

	MainChart.prototype.makeChart = function(containerId, priceData) {
		var chart = am4core.create(containerId, am4charts.XYChart);
		chart.paddingLeft = 0;
		chart.paddingRight = 0;
		chart.language.locale = am4lang_ko_KR;

		chart.data = this.generateData(priceData.avgPrice);
		return chart;
	};

	MainChart.prototype.generateData = function(initValue) {
		var result = [];
		for (var i = 0; i < 120; i++) {
			result.push({
				point: i,
				value: i === 0 ? initValue : null,
				value1: null,
				value2: null,
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
		series.dataFields.valueY = 'value1';
		series.strokeWidth = 1;
		series.stroke = am4core.color('#dfdfdf');
		series.strokeOpacity = 0.3;
		series.tensionX = 0.8;
		series.connect = false;
		return series;
	};

	MainChart.prototype.makeMinSeries = function() {
		var series = this.mainChart.series.push(new am4charts.LineSeries());
		series.dataFields.categoryX = 'point';
		series.dataFields.valueY = 'value2';
		series.strokeWidth = 1;
		series.stroke = am4core.color('#dfdfdf');
		series.strokeOpacity = 0.3;
		series.tensionX = 0.8;
		series.connect = false;
		return series;
	};

	MainChart.prototype.makeBaseSeries = function() {
		var series = this.mainChart.series.push(new am4charts.LineSeries());
		series.dataFields.categoryX = 'point';
		series.dataFields.valueY = 'value';
		series.strokeWidth = 2;
		series.tensionX = 0.8;
		series.connect = false;
		series.stroke = am4core.color('#28df40');
		return series;
	};

	MainChart.prototype.makeResultSeries = function() {
		var series = this.mainChart.series.push(new am4charts.LineSeries());
		series.dataFields.categoryX = 'point';
		series.dataFields.valueY = 'value3';
		series.strokeWidth = 2;
		series.tensionX = 0.8;
		series.connect = false;
		series.stroke = am4core.color('#32CD32');
		return series;
	};

	MainChart.prototype.makeBasePoint = function() {
		var bullet = this.resultValueLine.bullets.push(new am4charts.CircleBullet());
		bullet.circle.fill = am4core.color(App.COLOR.UP);
		bullet.circle.strokeWidth = 2;
		bullet.circle.propertyFields.radius = 'townSize';
		return bullet;
	};

	MainChart.prototype.makeBullet = function() {
		var bullet = this.baseValueLine.createChild(am4charts.CircleBullet);
		bullet.circle.radius = 7;
		bullet.fillOpacity = 2;
		bullet.fill = am4core.color(App.COLOR.DOWN);
		bullet.strokeOpacity = 0;
		bullet.isMeasured = false;
		return bullet;
	};

	MainChart.prototype.setupEvent = function() {
		this.baseValueLine.events.on('validated', function() {
			this.baseLine.data[0].value = this.valueAxis.max;
			this.baseLine.data[1].value = this.valueAxis.min;
			if (this.baseValueLine.dataItems.last.valueY) {
				if (this.baseValueLine.dataItems.last.valueY >= this.leftBaseValue) {
					this.bullet.fill = am4core.color(App.COLOR.UP);
				} else {
					this.bullet.fill = am4core.color(App.COLOR.DOWN);
				}
				this.bullet.stroke = this.bullet.fill;
				this.bullet.moveTo(this.baseValueLine.dataItems.last.point);
				this.bullet.validatePosition();
			}
		}.bind(this));

		this.resultValueLine.events.on('validated', function() {
			this.baseLine.data[0].value = this.valueAxis.max;
			this.baseLine.data[1].value = this.valueAxis.min;
			if (this.resultValueLine.dataItems.last.valueY) {
				if (this.resultValueLine.dataItems.last.valueY >= this.baseValue) {
					this.bullet.fill = am4core.color(App.COLOR.UP);
				} else {
					this.bullet.fill = am4core.color(App.COLOR.DOWN);
				}
				this.bullet.stroke = this.bullet.fill;
				this.bullet.moveTo(this.resultValueLine.dataItems.last.point);
				this.bullet.validatePosition();
			}
		}.bind(this));
	};

	MainChart.prototype.makeBaseLine = function(priceData) {
		var trend = this.mainChart.series.push(new am4charts.LineSeries());
		trend.dataFields.valueY = 'value';
		trend.dataFields.categoryX = 'point';
		trend.strokeWidth = 2;
		trend.stroke = am4core.color('#afab58');
		trend.data = [{
			point: App.main.getBasePoint(), value: priceData.maxPrice,
		}, {
			point: App.main.getBasePoint(), value: priceData.minPrice,
		}];

		return trend;
	};

	MainChart.prototype.makeResultLine = function(baseValue) {
		var resultBaseLine = this.mainChart.series.push(new am4charts.LineSeries());
		resultBaseLine.dataFields.valueY = 'value';
		resultBaseLine.dataFields.categoryX = 'point';
		resultBaseLine.strokeWidth = 2;
		resultBaseLine.strokeOpacity = 0.5;
		resultBaseLine.stroke = am4core.color('#dfdfdf');
		resultBaseLine.data = [{ point: App.main.getBasePoint(), value: baseValue }, { point: 119, value: baseValue }];

		var resultDynamicLine = this.mainChart.series.push(new am4charts.LineSeries());
		resultDynamicLine.dataFields.valueY = 'value';
		resultDynamicLine.dataFields.categoryX = 'point';
		resultDynamicLine.dataFields.openValueY = 'baseValue';
		resultDynamicLine.fillOpacity = 0.1;
		resultDynamicLine.propertyFields.fill = 'color';
		resultDynamicLine.propertyFields.stroke = 'color';
		resultDynamicLine.strokeWidth = 1;
		resultDynamicLine.strokeOpacity = 0.5;
		resultDynamicLine.data = [
			{ point: App.main.getBasePoint(), value: baseValue, baseValue: baseValue, color: App.COLOR.DOWN },
			{ point: 119, value: baseValue, baseValue: baseValue, color: App.COLOR.DOWN },
		];

		this.resultLine = resultDynamicLine;
	};

	return MainChart;
}());
