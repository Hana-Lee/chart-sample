document.addEventListener('DOMContentLoaded', function () {
	var COLOR = { UP: '#FF4C4A', DOWN: '#007BFF' };
	var socket = io.connect(location.href);
	var app = new App();
	socket.on('priceData', function (data) {
		priceDataReceiveHandler(data);
	});

	function priceDataReceiveHandler(data) {
		if (!app.hasMainChart()) {
			app.addMainChart(new MainChart('main_chart_div', data.avgPrice));
			app.addBaseChart(new UpDownChart('base_chart_div', [{
				'base': 'One',
				'value': data.avgPrice,
				baseValue: data.avgPrice,
				color: COLOR.UP,
			}], data.maxPrice, data.minPrice));
		}

		app.start(data);

		this.baseLine = new TrendLine(this.mainChart, this.max, this.min, this.basePoint).getLine();
	}
});

var App = {
	count : 0,
	min : 0,
	max : 0,
	basePoint : 60,
	startBaseValue : 0,
	resultBaseValue : 0,
	endCount : 119,
	basePointValue : 0,
	mainChart: undefined,
	baseChart: undefined,
	resultChart: undefined,
	resultLine: undefined,
	timeInterval: undefined,

	constructor:function() {
		this.startTimer();
	},

	hasMainChart: function() {
		return this.mainChart !== undefined;
	},

	addMainChart: function(mainChart) {
		this.mainChart = mainChart;
	},

	addBaseChart: function(baseChart) {
		this.baseChart = baseChart;
	},

	setMax: function(max) {
		this.max = max;
	},

	setMin: function(min) {
		this.min = min;
	},

	startTimer: function() {
		this.timeInterval = setInterval(function() {
			document.querySelector('#current-time').textContent = moment().format('HH:mm:ss');
		}, 1000);
	},

	stopTimer: function() {
		clearInterval(this.timeInterval);
	},

	isLastCount: function() {
		return this.count === this.endCount;
	},

	updateResultValueElem: function(value) {
		document.querySelector('#result-value').textContent = value + '';
	},

	updateBaseValueElem: function(value) {
		document.querySelector('#base-value').textContent = value + '';
	},

	isBasePointCount: function() {
		return this.count === this.basePoint;
	},

	isResultAreaCount: function() {
		return this.count >= this.basePoint;
	},

	addResultChart: function(initValue) {
		this.resultChart = new UpDownChart('right_chart_div', [{
			'base': 'One',
			'value': initValue,
			baseValue: initValue,
			color: COLOR.UP,
		}], this.max, this.min);
	},

	showBaseValueOverlay: function(data) {
		this.showValueOverlay('#base-value-overlay', data);
	},

	showResultValueOverlay: function(data) {
		this.showValueOverlay('#result-value-overlay', data);
	},

	showValueOverlay: function(elemSelector, data) {
		var overlayElem = document.querySelector(elemSelector);
		if (overlayElem.style.display === '') {
			var binanceValueElem = overlayElem.querySelector('.binance .value');
			var idaxValueElem = overlayElem.querySelector('.idax .value');
			var resultValueElem = overlayElem.querySelector('.base .value');
			binanceValueElem.textContent = data.biPrice.toFixed(2);
			idaxValueElem.textContent = data.ixPrice.toFixed(2);
			resultValueElem.textContent = data.avgPrice.toFixed(2);
			overlayElem.style.display = 'block';
		}
	},

	updateCurrentValueElem: function(value) {
		document.querySelector('#current-value').textContent = value.toFixed(2);
	},

	start: function(data) {
		this.setMax(data.maxPrice);
		this.setMin(data.minPrice);

		if (this.isLastCount()) {
			this.updateResultValueElem(data.avgPrice);
			this.showResultValueOverlay(data);
		}

		if (this.isBasePointCount()) {
			this.basePointValue = data.avgPrice;
			this.showBaseValueOverlay(data);
			this.updateBaseValueElem(data.avgPrice);
			this.addResultChart(data.avgPrice);
		}

		if (this.isResultAreaCount()) {
			this.mainChart.updateResultLineData(data.avgPrice, this.basePointValue);
		}

		this.mainChart.addData({
			time: this.count,
			value: data.avgPrice,
			townSize: this.isBasePointCount() ? 8 : 0,
			value1: data.biPrice,
			value2: data.ixPrice,
			startBaseTime: this.count,
			endBaseTime: this.count,
			startBaseValue: this.startBaseValue,
			endBaseValue: this.basePointValue,
		}, 1);
		this.mainChart.invalidateRawData();

		if (this.isResultAreaCount()) {
			this.resultChart.setBasePointValue(data.avgPrice);
			this.resultChart.updateData(data);
		} else {
			this.baseChart.setBasePointValue(data.avgPrice);
			this.baseChart.updateData(data);
		}
		this.updateCurrentValueElem(data.avgPrice);
		this.count++;
	}
};

var UpDownChart = {
	rightSeries: undefined,
	valueAxis: undefined,
	chart: undefined,
	basePointValue : 0,

	constructor:function(containerId, initDataData, min, max) {
		var chart = am4core.create(containerId, am4charts.XYChart);
		chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect
		chart.data = initDataData;
		chart.responsive.enabled = false;
		chart.paddingLeft = 0;
		chart.paddingRight = 0;

		var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.renderer.grid.template.location = 0;
		categoryAxis.renderer.grid.template.disabled = true;
		categoryAxis.renderer.inside = true;
		categoryAxis.dataFields.category = 'base';
		categoryAxis.renderer.minGridDistance = 5;
		categoryAxis.hidden = true;

		var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.renderer.labels.template.disabled = true;
		valueAxis.renderer.grid.template.disabled = true;
		valueAxis.renderer.inside = true;
		valueAxis.cursorTooltipEnabled = false;
		valueAxis.strictMinMax = true;

		valueAxis.min = min;
		valueAxis.max = max;

		this.valueAxis = valueAxis;

		var series = chart.series.push(new am4charts.ColumnSeries());
		series.dataFields.categoryX = 'base';
		series.dataFields.valueY = 'value';
		series.dataFields.openValueY = 'baseValue';
		series.fixedWidthGrid = true;
		series.columns.template.propertyFields.fill = 'color';
		series.columns.template.propertyFields.stroke = 'color';
		series.columns.template.width = am4core.percent(100);

		this.rightSeries = series;

		series.columns.template.events.on('validated', function (ev){
			ev.target.fill = am4core.color(chart.data[0].color);
			ev.target.stroke = am4core.color(chart.data[0].color);
			this.valueAxis.min = min;
			this.valueAxis.max = max;
		});
	},

	setBasePointValue: function(basePointValue) {
		if (this.basePointValue <= 0) {
			this.basePointValue = basePointValue;
		}
	},

	updateData: function(data) {
		this.chart.data[0].value = data.avgPrice;
		this.chart.data[0].baseValue = this.basePointValue;
		if (data.avgPrice >= this.basePointValue) {
			this.chart.data[0].color = COLOR.UP;
		} else {
			this.chart.data[0].color = COLOR.DOWN;
		}

		this.chart.invalidateRawData();
	},
};

var MainChart = {
	chart: undefined,
	resultLine: undefined,
	baseLine: undefined,
	bullet: undefined,
	leftBaseValue : 0,
	baseValue : 0,

	constructor: function(containerId, initValue) {
		this.chart = this.makeChart(containerId, initValue);
		this.makeCategoryAxis();
		this.makeValueAxis();
		this.makeMaxSeries();
		this.makeMinSeries();
		this.baseLine = this.makeBaseSeries();
		this.resultLine = this.makeResultSeries();
		this.bullet = this.makeBullet();
	},

	addData: function(rawDataItem, removeCount) {
		this.chart.addData(rawDataItem, removeCount);
	},

	invalidateRawData: function() {
		this.chart.invalidateRawData();
	},

	getChart: function() {
		return this.chart;
	},

	getBaseLine: function() {
		return this.baseLine;
	},

	updateResultLineData: function(value, basePointValue) {
		this.resultLine.data[0].value = value;
		this.resultLine.data[1].value = value;
		if (value >= basePointValue) {
			this.resultLine.data[0].color = COLOR.UP;
			this.resultLine.data[1].color = COLOR.UP;
		} else {
			this.resultLine.data[0].color = COLOR.DOWN;
			this.resultLine.data[1].color = COLOR.DOWN;
		}

		this.resultLine.invalidateRawData();
	},

	makeChart: function(containerId, initValue) {
		var chart = am4core.create(containerId, am4charts.XYChart);
		chart.paddingLeft = 0;
		chart.paddingRight = 0;
		chart.language.locale = am4lang_ko_KR;

		chart.data = this.generateData(initValue);
		return chart;
	},

	generateData: function(initValue) {
		var result = [];
		for (var i = 0; i < 120; i++) {
			result.push({
				time: i,
				value: i === 0 ? initValue : undefined,
				openValue: initValue,
				value1: undefined,
				value2: undefined,
				timeText: '',
				townSize: 0,
				value3: undefined,
				value4: undefined,
				startBaseTime: i,
				endBaseTime: i,
				startBaseValue: undefined,
				endBaseValue: undefined,
			});
		}
		return result;
	},

	makeCategoryAxis: function() {
		var categoryAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.dataFields.category = 'time';
		categoryAxis.renderer.minGridDistance = 10;
		categoryAxis.tooltip.disabled = true;
		categoryAxis.renderer.grid.template.disabled = true;
		categoryAxis.renderer.inside = true;
		categoryAxis.renderer.labels.template.disabled = true;

		categoryAxis.renderer.grid.template.location = 0.5;
		categoryAxis.startLocation = 0.5;
		categoryAxis.endLocation = 0.5;
		return categoryAxis;
	},

	makeValueAxis: function() {
		var valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.renderer.inside = true;
		valueAxis.renderer.labels.template.disabled = true;
		valueAxis.renderer.grid.template.disabled = true;
		valueAxis.cursorTooltipEnabled = false;
		valueAxis.strictMinMax = true;
		return valueAxis;
	},

	makeMaxSeries: function() {
		var series = this.chart.series.push(new am4charts.LineSeries());
		series.dataFields.categoryX = 'time';
		series.dataFields.valueY = 'value1';
		series.strokeWidth = 1;
		series.stroke = am4core.color('#dfdfdf');
		series.strokeOpacity = 0.3;
		series.tensionX = 0.8;
		series.connect = false;
		return series;
	},

	makeMinSeries: function() {
		var series = this.chart.series.push(new am4charts.LineSeries());
		series.dataFields.categoryX = 'time';
		series.dataFields.valueY = 'value2';
		series.strokeWidth = 1;
		series.stroke = am4core.color('#dfdfdf');
		series.strokeOpacity = 0.3;
		series.tensionX = 0.8;
		series.connect = false;
		return series;
	},

	makeBaseSeries: function() {
		var series = this.chart.series.push(new am4charts.LineSeries());
		series.dataFields.categoryX = 'time';
		series.dataFields.valueY = 'value';
		series.strokeWidth = 2;
		series.tensionX = 0.8;
		series.connect = false;
		series.stroke = am4core.color('#28df40');
		return series;
	},

	makeResultSeries: function() {
		var series = this.chart.series.push(new am4charts.LineSeries());
		series.dataFields.categoryX = 'time';
		series.dataFields.valueY = 'value3';
		series.strokeWidth = 2;
		series.tensionX = 0.8;
		series.connect = false;
		series.stroke = am4core.color('#32CD32');
		return series;
	},

	makeBasePoint: function() {
		var bullet = this.resultLine.bullets.push(new am4charts.CircleBullet());
		bullet.circle.fill = am4core.color(COLOR.UP);
		bullet.circle.strokeWidth = 2;
		bullet.circle.propertyFields.radius = 'townSize';
		return bullet;
	},

	makeBullet: function() {
		var bullet = this.baseLine.createChild(am4charts.CircleBullet);
		bullet.circle.radius = 7;
		bullet.fillOpacity = 2;
		bullet.fill = am4core.color(COLOR.DOWN);
		bullet.strokeOpacity = 0;
		bullet.isMeasured = false;
		return bullet;
	},

	setupEvent: function() {
		this.baseLine.events.on('validated', function(){
			// min = valueAxis.min;
			// max = valueAxis.max;
			// yTrendLine.data[0].value = valueAxis.max;
			// yTrendLine.data[1].value = valueAxis.min;
			if (this.baseLine.dataItems.last.valueY) {
				if (this.baseLine.dataItems.last.valueY >= this.leftBaseValue) {
					this.bullet.fill = am4core.color(COLOR.UP);
				} else {
					this.bullet.fill = am4core.color(COLOR.DOWN);
				}
				this.bullet.stroke = this.bullet.fill;
				this.bullet.moveTo(this.baseLine.dataItems.last.point);
				this.bullet.validatePosition();
			}
		}.bind(this));

		this.resultLine.events.on('validated', function(){
			// min = valueAxis.min;
			// max = valueAxis.max;
			// yTrendLine.data[0].value = valueAxis.max;
			// yTrendLine.data[1].value = valueAxis.min;
			if (this.resultLine.dataItems.last.valueY) {
				if (this.resultLine.dataItems.last.valueY >= this.baseValue) {
					this.bullet.fill = am4core.color(COLOR.UP);
				} else {
					this.bullet.fill = am4core.color(COLOR.DOWN);
				}
				this.bullet.stroke = this.bullet.fill;
				this.bullet.moveTo(this.resultLine.dataItems.last.point);
				this.bullet.validatePosition();
			}
		}.bind(this));
	}
};

var TrendLine ={
	trendLine:0,

	constructor:function(parentChart, max, min, basePoint) {
		var trend = parentChart.getChart().series.push(new am4charts.LineSeries());
		trend.dataFields.valueY = 'value';
		trend.dataFields.categoryX = 'time';
		trend.strokeWidth = 2;
		trend.stroke = am4core.color('#afab58');
		trend.data = [{ time: basePoint, value: max }, { time: basePoint, value: min }];

		this.trendLine = trend;
	},

	getLine:function() {
		return this.trendLine;
	}
}

var ResultLine = {
	resultLine:0,

	constructor:function(parentChart, max, min, basePoint, baseValue) {
		var resultBaseLine = parentChart.getChart().series.push(new am4charts.LineSeries());
		resultBaseLine.dataFields.valueY = 'value';
		resultBaseLine.dataFields.categoryX = 'time';
		resultBaseLine.strokeWidth = 2;
		resultBaseLine.strokeOpacity = 0.5;
		resultBaseLine.stroke = am4core.color('#dfdfdf');
		resultBaseLine.data = [{ time: basePoint, value: baseValue }, { time: 119, value: baseValue }];

		var resultDynamicLine = parentChart.getChart().series.push(new am4charts.LineSeries());
		resultDynamicLine.dataFields.valueY = 'value';
		resultDynamicLine.dataFields.categoryX = 'time';
		resultDynamicLine.dataFields.openValueY = 'baseValue';
		resultDynamicLine.fillOpacity = 0.1;
		resultDynamicLine.propertyFields.fill = 'color';
		resultDynamicLine.propertyFields.stroke = 'color';
		resultDynamicLine.strokeWidth = 1;
		resultDynamicLine.strokeOpacity = 0.5;
		resultDynamicLine.data = [
			{ time: basePoint, value: baseValue, baseValue: baseValue, color: COLOR.DOWN },
			{ time: 119, value: baseValue, baseValue: baseValue, color: COLOR.DOWN },
		];

		this.resultLine = resultDynamicLine;
	},

	getLine:function() {
		return this.resultLine;
	}
};
