// import * as am4core from '@amcharts/amcharts4/core';
// import * as am4charts from '@amcharts/amcharts4/charts';
// import am4themes_animated from '@amcharts/amcharts4/themes/animated';
// import am4themes_dark from '@amcharts/amcharts4/themes/dark';
// import am4lang_ko_KR from '@amcharts/amcharts4/lang/ko_KR';
// import * as io from 'socket.io-client';
//
// am4core.useTheme(am4themes_animated);
// am4core.useTheme(am4themes_dark);
//
// class SocketClient {
// 	constructor() {
//
// 	}
// }
//
// class Main {
// 	private _count: number = 0;
// 	private _min: number = 0;
// 	private _max: number = 0;
// 	private _basePoint: number = 60;
// 	private _startBaseValue: number = 0;
// 	private _resultBaseValue: number = 0;
// 	private _mainChart = null;
// 	private _baseChart = null;
// 	private _resultChart = null;
// 	private _baseLine = null;
// 	private _resultLine = null;
//
// 	constructor() {
// 		const socket = io.connect(location.href);
// 		socket.on('news', (data: any) => {
// 			console.log('news data 123123', data);
// 			socket.emit('my other event', { my: 'data.ts' });
// 		});
// 		socket.on('priceData', (data: any) => {
// 			this.start(data);
// 		});
// 	}
//
// 	start(data: any) {
// 		if ((this._count > 60 && this._count < 119) && this._count % 2 > 0) {
// 			this._count++;
// 			return false;
// 		}
// 		if (this._min === 0) {
// 			this._min = data.minPrice;
// 			this._max = data.maxPrice;
// 		}
// 		let endBaseValue = null;
// 		const data1Value = data.biPrice;
// 		const data2Value = data.ixPrice;
// 		let mainDataValue = data.avgPrice;
// 		if (!this._mainChart) {
// 			this._mainChart = new MainChart('chart_div', mainDataValue);
// 			this._baseLine = new TrendLine(this._mainChart, this._max, this._min);
// 		}
// 		if (!this._baseChart) {
// 			this._baseChart = new BaseChart('left_chart_div', [{
// 				'base': 'One',
// 				'value': mainDataValue,
// 				baseValue: mainDataValue,
// 				color: '#ff4c4a',
// 			}]);
// 		}
// 		if (this._count === 120) {
// 			document.querySelector('#result-value').textContent = mainDataValue;
// 			return false;
// 		}
//
// 		let townSize = 0;
// 		let timeText = '';
// 		if (this._count === this._basePoint) {
// 			if (!this._resultChart) {
// 				this._resultChart = new ResultChart('right_chart_div', [{
// 					'base': 'One',
// 					'value': mainDataValue,
// 					baseValue: mainDataValue,
// 					color: '#ff4c4a',
// 				}]);
// 			}
// 			townSize = 8;
// 		}
// 		if (this._count <= 0 || this._count === this._basePoint || this._count === 119) {
// 			timeText = data.timeString;
// 		}
// 		const time = this._count;
// 		let startBaseTime = this._count;
// 		let endBaseTime = this._count;
// 		let value3 = null;
// 		if (this._count === 0) {
// 			this._startBaseValue = mainDataValue;
// 		}
// 		if (this._count < this._basePoint) {
// 			startBaseTime = 0;
// 		}
// 		if (this._count === this._basePoint) {
// 			endBaseValue = mainDataValue;
// 		}
// 		if (this._count >= this._basePoint) {
// 			endBaseTime = 119;
// 		}
//
// 		if (this._count === this._basePoint) {
// 			this._resultLine = this._mainChart.createTrendLine2();
// 			document.querySelector('#base-value').textContent = mainDataValue;
// 		}
//
// 		if (this._resultLine) {
// 			this._resultLine.data[0].value = mainDataValue;
// 			this._resultLine.data[1].value = mainDataValue;
// 			if (mainDataValue >= endBaseValue) {
// 				this._resultLine.data[0].color = '#ff4c4a';
// 				this._resultLine.data[1].color = '#ff4c4a';
// 			} else {
// 				this._resultLine.data[0].color = '#007bff';
// 				this._resultLine.data[1].color = '#007bff';
// 			}
// 			this._resultLine.invalidateRawData();
// 		}
//
// 		if (this._count >= this._basePoint) {
// 			if (document.querySelector('#base-value-overlay').style.display === '') {
// 				document.querySelector('#base-value-overlay .binance .value').textContent = data1Value;
// 				document.querySelector('#base-value-overlay .idax .value').textContent = data2Value;
// 				document.querySelector('#base-value-overlay .base .value').textContent = mainDataValue;
// 				document.querySelector('#base-value-overlay').style.display = 'block';
// 			}
// 			value3 = mainDataValue;
// 		}
// 		if (this._count > this._basePoint) {
// 			mainDataValue = null;
// 		}
//
// 		if (this._count === 119) {
// 			if (document.querySelector('#result-value-overlay').style.display === '') {
// 				document.querySelector('#result-value-overlay .binance .value').textContent = data1Value;
// 				document.querySelector('#result-value-overlay .idax .value').textContent = data2Value;
// 				document.querySelector('#result-value-overlay .result .value').textContent = value3;
// 				document.querySelector('#result-value-overlay').style.display = 'block';
// 			}
// 		}
//
// 		this._mainChart.addData({
// 			time: time,
// 			value: mainDataValue,
// 			value3: value3,
// 			townSize: townSize,
// 			timeText: timeText,
// 			value1: data1Value,
// 			value2: data2Value,
// 			startBaseTime: startBaseTime,
// 			endBaseTime: endBaseTime,
// 			startBaseValue: this._startBaseValue,
// 			endBaseValue: endBaseValue,
// 		}, true);
// 		this._mainChart.invalidateRawData();
//
// 		if (this._count === this._basePoint) {
// 			this._resultBaseValue = value3;
// 		}
//
// 		if (this._count > this._basePoint) {
// 			this._resultChart.data[0].value = value3;
// 			if (this._resultBaseValue) {
// 				this._resultChart.data[0].baseValue = this._resultBaseValue;
// 			}
// 			if (value3 >= this._resultBaseValue) {
// 				this._resultChart.data[0].color = '#ff4c4a';
// 			} else {
// 				this._resultChart.data[0].color = '#007bff';
// 			}
//
// 			this._resultChart.invalidateRawData();
// 		} else {
// 			this._baseChart.data[0].value = mainDataValue;
//
// 			if (this._count === 0) {
// 				this._baseChart.data[0].baseValue = this._startBaseValue;
// 			}
// 			if (mainDataValue >= this._startBaseValue) {
// 				this._baseChart.data[0].color = '#ff4c4a';
// 			} else {
// 				this._baseChart.data[0].color = '#007bff';
// 			}
// 			this._baseChart.invalidateRawData();
// 		}
//
// 		document.querySelector('#current-value').textContent = mainDataValue || value3;
// 		this._count++;
// 	}
// }
//
// class BaseChart {
// 	constructor(containerId: string, initData: any) {
// 	}
// }
//
// class ResultChart {
// 	constructor(containerId: string, initData: any) {
// 	}
// }
//
// class MainChart {
// 	private chart: am4charts.XYChart = null;
// 	private resultSeries: am4charts.LineSeries = null;
// 	private baseSeries: am4charts.LineSeries = null;
// 	private bullet: am4charts.CircleBullet = null;
//
// 	constructor(containerId: string, initValue: number) {
// 		this.chart = this.makeChart(containerId, initValue);
// 		this.makeCategoryAxis();
// 		this.makeValueAxis();
// 		this.makeMaxSeries();
// 		this.makeMinSeries();
// 		this.baseSeries = this.makeBaseSeries();
// 		this.bullet = this.makeBullet();
// 	}
//
// 	private generateData(initValue: number): any {
// 		const result = [];
// 		for (let i = 0; i < 120; i++) {
// 			result.push({
// 				time: i,
// 				value: i === 0 ? initValue : null,
// 				openValue: initValue,
// 				value1: null,
// 				value2: null,
// 				timeText: '',
// 				townSize: 0,
// 				value3: null,
// 				value4: null,
// 				startBaseTime: i,
// 				endBaseTime: i,
// 				startBaseValue: null,
// 				endBaseValue: null,
// 			});
// 		}
// 		return result;
// 	}
//
// 	private makeChart(containerId: string, initValue: number): am4charts.XYChart {
// 		const chart: am4charts.XYChart = am4core.create(containerId, am4charts.XYChart);
// 		chart.paddingLeft = 0;
// 		chart.paddingRight = 0;
// 		chart.language.locale = am4lang_ko_KR;
//
// 		chart.data = this.generateData(initValue);
// 		return chart;
// 	}
//
// 	private makeCategoryAxis(): am4charts.CategoryAxis {
// 		const categoryAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
// 		categoryAxis.dataFields.category = 'time';
// 		categoryAxis.renderer.minGridDistance = 10;
// 		categoryAxis.tooltip.disabled = true;
// 		categoryAxis.renderer.grid.template.disabled = true;
// 		categoryAxis.renderer.inside = true;
// 		categoryAxis.renderer.labels.template.disabled = true;
//
// 		categoryAxis.renderer.grid.template.location = 0.5;
// 		categoryAxis.startLocation = 0.5;
// 		categoryAxis.endLocation = 0.5;
// 		return categoryAxis;
// 	}
//
// 	private makeValueAxis(): am4charts.ValueAxis {
// 		const valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
// 		valueAxis.renderer.inside = true;
// 		valueAxis.renderer.labels.template.disabled = true;
// 		valueAxis.renderer.grid.template.disabled = true;
// 		valueAxis.cursorTooltipEnabled = false;
// 		valueAxis.strictMinMax = true;
// 		return valueAxis;
// 	}
//
// 	private makeMaxSeries(): am4charts.LineSeries {
// 		const series = this.chart.series.push(new am4charts.LineSeries());
// 		series.dataFields.categoryX = 'time';
// 		series.dataFields.valueY = 'value1';
// 		series.strokeWidth = 1;
// 		series.stroke = am4core.color('#dfdfdf');
// 		series.strokeOpacity = 0.3;
// 		series.tensionX = 0.8;
// 		series.connect = false;
// 		return series;
// 	}
//
// 	private makeMinSeries(): am4charts.LineSeries {
// 		const series = this.chart.series.push(new am4charts.LineSeries());
// 		series.dataFields.categoryX = 'time';
// 		series.dataFields.valueY = 'value2';
// 		series.strokeWidth = 1;
// 		series.stroke = am4core.color('#dfdfdf');
// 		series.strokeOpacity = 0.3;
// 		series.tensionX = 0.8;
// 		series.connect = false;
// 		return series;
// 	}
//
// 	private makeBaseSeries(): am4charts.LineSeries {
// 		const series = this.chart.series.push(new am4charts.LineSeries());
// 		series.dataFields.categoryX = 'time';
// 		series.dataFields.valueY = 'value';
// 		series.strokeWidth = 2;
// 		series.tensionX = 0.8;
// 		series.connect = false;
// 		series.stroke = am4core.color('#28df40');
// 		return series;
// 	}
//
// 	private makeResultSeries(): am4charts.LineSeries {
// 		const series = this.chart.series.push(new am4charts.LineSeries());
// 		series.dataFields.categoryX = 'time';
// 		series.dataFields.valueY = 'value3';
// 		series.strokeWidth = 2;
// 		series.tensionX = 0.8;
// 		series.connect = false;
// 		series.stroke = am4core.color('#32CD32');
// 		return series;
// 	}
//
// 	private makeBasePoint(): am4charts.CircleBullet {
// 		const bullet = this.resultSeries.bullets.push(new am4charts.CircleBullet());
// 		bullet.circle.fill = am4core.color('#ff4c4a');
// 		bullet.circle.strokeWidth = 2;
// 		bullet.circle.propertyFields.radius = 'townSize';
// 		return bullet;
// 	}
//
// 	private makeBullet(): am4charts.CircleBullet {
// 		const bullet = this.baseSeries.createChild(am4charts.CircleBullet);
// 		bullet.circle.radius = 7;
// 		bullet.fillOpacity = 2;
// 		bullet.fill = am4core.color('#007bff');
// 		bullet.strokeOpacity = 0;
// 		bullet.isMeasured = false;
// 		return bullet;
// 	}
//
// 	private setupEvent() {
// 		this.baseSeries.events.on('validated', () => {
// 			// min = valueAxis.min;
// 			// max = valueAxis.max;
// 			// yTrendLine.data[0].value = valueAxis.max;
// 			// yTrendLine.data[1].value = valueAxis.min;
// 			if (this.baseSeries.dataItems.last.valueY) {
// 				if (this.baseSeries.dataItems.last.valueY >= leftBaseValue) {
// 					this.bullet.fill = am4core.color('#ff4c4a');
// 				} else {
// 					this.bullet.fill = am4core.color('#007bff');
// 				}
// 				this.bullet.stroke = this.bullet.fill;
// 				this.bullet.moveTo(this.baseSeries.dataItems.last.point);
// 				this.bullet.validatePosition();
// 			}
// 		});
//
// 		this.resultSeries.events.on('validated', () => {
// 			// min = valueAxis.min;
// 			// max = valueAxis.max;
// 			// yTrendLine.data[0].value = valueAxis.max;
// 			// yTrendLine.data[1].value = valueAxis.min;
// 			if (this.resultSeries.dataItems.last.valueY) {
// 				if (this.resultSeries.dataItems.last.valueY >= baseValue) {
// 					this.bullet.fill = am4core.color('#ff4c4a');
// 				} else {
// 					this.bullet.fill = am4core.color('#007bff');
// 				}
// 				this.bullet.stroke = this.bullet.fill;
// 				this.bullet.moveTo(this.resultSeries.dataItems.last.point);
// 				this.bullet.validatePosition();
// 			}
// 		});
// 	}
// }
//
// class TrendLine {
// 	constructor(parentChart, max: number, min: number) {
//
// 	}
// }
//
// (function() {
//
// 	function makeCenterChart(initValue) {
//
//
// 		// series.stroke = am4core .color('#FFFF66');
// 		// series.stroke = am4core.color('#ff4c4a');
// 		// series.fill = am4core.color('#ff4c4a');
//
//
// 		// series2.fill = am4core.color('#ff4c4a');
//
// 		// Add bullets
//
//
// 		// data2Series.fill = am4core.color('#acbea3');
// 		// data2Series.stroke = am4core.color('#acbea3');
//
// 		// bullet at the front of the line
//
//
// 		return chart;
// 	}
//
// 	let leftValueAxis;
// 	let rightValueAxis;
//
// 	function makeSideChart(chartContainer, chartData, position) {
// 		const chart = am4core.create(chartContainer, am4charts.XYChart);
// 		chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect
// 		chart.data = chartData;
// 		chart.columnSpace = 0;
// 		chart.responsive.enabled = false;
// 		chart.paddingLeft = 0;
// 		chart.paddingRight = 0;
//
// 		const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
// 		categoryAxis.renderer.grid.template.location = 0;
// 		categoryAxis.renderer.grid.template.disabled = true;
// 		categoryAxis.renderer.inside = true;
// 		categoryAxis.dataFields.category = 'base';
// 		categoryAxis.renderer.minGridDistance = 5;
// 		categoryAxis.hidden = true;
//
// 		const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
// 		valueAxis.renderer.labels.template.disabled = true;
// 		valueAxis.renderer.grid.template.disabled = true;
// 		valueAxis.renderer.inside = true;
// 		valueAxis.cursorTooltipEnabled = false;
// 		valueAxis.strictMinMax = true;
//
// 		valueAxis.min = min;
// 		valueAxis.max = max;
//
// 		if (position === 'left') {
// 			leftValueAxis = valueAxis;
// 		} else {
// 			rightValueAxis = valueAxis;
// 		}
//
// 		const series = chart.series.push(new am4charts.ColumnSeries());
// 		series.dataFields.categoryX = 'base';
// 		series.dataFields.valueY = 'value';
// 		series.dataFields.openValueY = 'baseValue';
// 		series.fixedWidthGrid = true;
// 		series.columns.template.propertyFields.fill = "color";
// 		series.columns.template.propertyFields.stroke = "color";
// 		series.columns.template.width = am4core.percent(100);
//
// 		rightSeries = series;
//
// 		// series.columns.template.strokeOpacity = 0;
// 		// series.columns.template.fillOpacity = 0.75;
//
// 		// var columnTemplate = series.columns.template;
// 		// columnTemplate.strokeOpacity = 0;
// 		// columnTemplate.propertyFields.fill = 'color';
// 		// columnTemplate.width = am4core.percent(100);
//
// // Add distinctive colors for each column using adapter
// // 		series.columns.template.adapter.add('fill', function (fill, target) {
// // 			console.log('fill');
// // 			return chart.colors.getIndex(target.dataItem.index);
// // 		});
// 		series.columns.template.events.on('validated', function(ev) {
// 			// if (chart.data[0].value >= chart.data[0].baseValue) {
// 			ev.target.fill = am4core.color(chart.data[0].color);
// 			ev.target.stroke = am4core.color(chart.data[0].color);
// 			leftValueAxis.min = min;
// 			leftValueAxis.max = max;
// 			if (rightValueAxis) {
// 				rightValueAxis.min = min;
// 				rightValueAxis.max = max;
// 			}
// 			// } else {
// 			// 	ev.target.fill = am4core.color('#007bff')
// 			// }
// 		});
// 		return chart;
// 	}
//
// 	function createTrendLine() {
// 		const trend = mainChart.series.push(new am4charts.LineSeries());
// 		trend.dataFields.valueY = 'value';
// 		trend.dataFields.categoryX = 'time';
// 		trend.strokeWidth = 2;
// 		trend.stroke = am4core.color('#afab58');
// 		trend.data = [{ time: basePoint, value: max }, { time: basePoint, value: min }];
// 		return trend;
// 	}
//
// 	function createTrendLine2() {
// 		const trend2 = mainChart.series.push(new am4charts.LineSeries());
// 		trend2.dataFields.valueY = 'value';
// 		trend2.dataFields.categoryX = 'time';
// 		trend2.strokeWidth = 2;
// 		trend2.strokeOpacity = 0.5;
// 		trend2.stroke = am4core.color('#dfdfdf');
// 		trend2.data = [{ time: basePoint, value: baseValue }, { time: 119, value: baseValue }];
//
// 		const trend3 = mainChart.series.push(new am4charts.LineSeries());
// 		trend3.dataFields.valueY = 'value';
// 		trend3.dataFields.categoryX = 'time';
// 		trend3.dataFields.openValueY = 'baseValue';
// 		trend3.fillOpacity = 0.1;
// 		// trend3.fill = am4core.color('#ff4c4a');
// 		// trend3.fill = am4core.color('#007bff');
// 		trend3.propertyFields.fill = "color";
// 		trend3.propertyFields.stroke = "color";
// 		trend3.strokeWidth = 1;
// 		trend3.strokeOpacity = 0.5;
// 		// trend3.stroke = am4core.color('#dfdfdf');
// 		trend3.data = [
// 			{ time: basePoint, value: baseValue, baseValue: baseValue, color: '#007bff' },
// 			{ time: 119, value: baseValue, baseValue: baseValue, color: '#007bff' },
// 		];
//
// 		return trend3;
//
// 		// var bullet = trend2.bullets.push(new am4charts.CircleBullet());
// 		// bullet.strokeWidth = 2;
// 		// bullet.stroke = am4core.color('#fff');
// 		// bullet.circle.fill = trend2.stroke;
// 	}
//
// 	let trendLine = null;
//
// 	let timeInterval = null;
//
// 	function startTimeInterval() {
// 		timeInterval = setInterval(function() {
// 			document.querySelector('#current-time').textContent = moment().format('HH:mm:ss');
// 		}, 1000);
// 	}
//
// 	function endTimeInterval() {
// 		if (timeInterval) {
// 			clearInterval(timeInterval);
// 		}
// 	}
//
// 	function stopInterval() {
// 		clearInterval(intervalId);
// 	}
//
// 	function showOverlay() {
// 		document.querySelector('#overlay').style.display = 'block';
// 		setTimeout(function() {
// 			overlayOff();
// 		}, 1000);
// 	}
//
// 	function overlayOff() {
// 		document.querySelector('#overlay').style.display = 'none';
// 	}
//
// 	document.querySelector('#start-interval').addEventListener('click', function() {
// 		showOverlay();
// 	});
//
// 	document.querySelector('#window-height').addEventListener('click', function() {
// 		showOverlay();
// 	});
//
// 	document.querySelector('#game-over').addEventListener('click', function() {
// 		showOverlay();
// 	});
//
// 	document.querySelector('#current-time').addEventListener('click', function() {
// 		stopInterval();
// 	});
//
// 	// startInterval();
// 	startTimeInterval();
// }());
