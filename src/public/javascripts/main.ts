import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import am4themes_dark from '@amcharts/amcharts4/themes/dark';
import am4lang_ko_KR from '@amcharts/amcharts4/lang/ko_KR';
import * as io from 'socket.io-client';
import moment from 'moment';

am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_dark);

const COLOR = { UP: '#FF4C4A', DOWN: '#007BFF' };

class SocketClient {
	constructor() {

	}
}

class Main {
	private count: number = 0;
	private min: number = 0;
	private max: number = 0;
	private basePoint: number = 60;
	private startBaseValue: number = 0;
	private resultBaseValue: number = 0;
	private mainChart: MainChart;
	private baseChart: BaseChart;
	private resultChart: ResultChart;
	private baseLine: am4charts.LineSeries;
	private resultLine: am4charts.LineSeries;
	private timeInterval: NodeJS.Timeout;

	constructor() {
		const socket = io.connect(location.href);
		socket.on('news', (data: any) => {
			console.log('news data 123123', data);
			socket.emit('my other event', { my: 'data.ts' });
		});
		socket.on('priceData', (data: any) => {
			this.start(data);
		});
	}

	public startTimer(): void {
		this.timeInterval = setInterval(function() {
			document.querySelector('#current-time').textContent = moment().format('HH:mm:ss');
		}, 1000);
	}

	public stopTimer(): void {
		clearInterval(this.timeInterval);
	}

	public start(data: any): void {
		if ((this.count > 60 && this.count < 119) && this.count % 2 > 0) {
			this.count++;
		} else {
			if (this.min === 0) {
				this.min = data.minPrice;
				this.max = data.maxPrice;
			}
			let endBaseValue;
			const data1Value = data.biPrice;
			const data2Value = data.ixPrice;
			let mainDataValue = data.avgPrice;
			if (!this.mainChart) {
				this.mainChart = new MainChart('chart_div', mainDataValue);
				this.baseLine = new TrendLine(this.mainChart, this.max, this.min, this.basePoint).getLine();
			}
			if (!this.baseChart) {
				this.baseChart = new BaseChart('left_chart_div', [{
					'base': 'One',
					'value': mainDataValue,
					baseValue: mainDataValue,
					color: COLOR.UP,
				}], 'left', this.max, this.min);
			}
			if (this.count === 120) {
				document.querySelector('#result-value').textContent = mainDataValue;
			}

			let townSize = 0;
			let timeText = '';
			if (this.count === this.basePoint) {
				if (!this.resultChart) {
					this.resultChart = new ResultChart('right_chart_div', [{
						'base': 'One',
						'value': mainDataValue,
						baseValue: mainDataValue,
						color: COLOR.UP,
					}], 'right', this.max, this.min);
				}
				townSize = 8;
			}
			if (this.count <= 0 || this.count === this.basePoint || this.count === 119) {
				timeText = data.timeString;
			}
			const time = this.count;
			let startBaseTime = this.count;
			let endBaseTime = this.count;
			let value3;
			if (this.count === 0) {
				this.startBaseValue = mainDataValue;
			}
			if (this.count < this.basePoint) {
				startBaseTime = 0;
			}
			if (this.count === this.basePoint) {
				endBaseValue = mainDataValue;
			}
			if (this.count >= this.basePoint) {
				endBaseTime = 119;
			}

			if (this.count === this.basePoint) {
				this.resultLine = this.mainChart.getResultLine();
				document.querySelector('#base-value').textContent = mainDataValue;
			}

			if (this.resultLine) {
				this.resultLine.data[0].value = mainDataValue;
				this.resultLine.data[1].value = mainDataValue;
				if (mainDataValue >= endBaseValue) {
					this.resultLine.data[0].color = COLOR.UP;
					this.resultLine.data[1].color = COLOR.UP;
				} else {
					this.resultLine.data[0].color = COLOR.DOWN;
					this.resultLine.data[1].color = COLOR.DOWN;
				}
				this.resultLine.invalidateRawData();
			}

			if (this.count >= this.basePoint) {
				const overlayElem: HTMLDivElement = document.querySelector('#base-value-overlay');
				if (overlayElem.style.display === '') {
					const binanceValueElem: HTMLSpanElement = overlayElem.querySelector('.binance .value');
					const idaxValueElem: HTMLSpanElement = overlayElem.querySelector('.idax .value');
					const baseValueElem: HTMLSpanElement = overlayElem.querySelector('.base .value');
					binanceValueElem.textContent = data1Value;
					idaxValueElem.textContent = data2Value;
					baseValueElem.textContent = mainDataValue;
					overlayElem.style.display = 'block';
				}
				value3 = mainDataValue;
			}
			if (this.count > this.basePoint) {
				mainDataValue = undefined;
			}

			if (this.count === 119) {
				const overlayElem: HTMLDivElement = document.querySelector('#result-value-overlay');
				if (overlayElem.style.display === '') {
					const binanceValueElem: HTMLSpanElement = overlayElem.querySelector('.binance .value');
					const idaxValueElem: HTMLSpanElement = overlayElem.querySelector('.idax .value');
					const resultValueElem: HTMLSpanElement = overlayElem.querySelector('.base .value');
					binanceValueElem.textContent = data1Value;
					idaxValueElem.textContent = data2Value;
					resultValueElem.textContent = mainDataValue;
					overlayElem.style.display = 'block';
				}
			}

			this.mainChart.addData({
				time: time,
				value: mainDataValue,
				value3: value3,
				townSize: townSize,
				timeText: timeText,
				value1: data1Value,
				value2: data2Value,
				startBaseTime: startBaseTime,
				endBaseTime: endBaseTime,
				startBaseValue: this.startBaseValue,
				endBaseValue: endBaseValue,
			}, 1);
			this.mainChart.invalidateRawData();

			if (this.count === this.basePoint) {
				this.resultBaseValue = value3;
			}

			if (this.count > this.basePoint) {
				this.resultChart.getData().value = value3;
				if (this.resultBaseValue) {
					this.resultChart.getData().baseValue = this.resultBaseValue;
				}
				if (value3 >= this.resultBaseValue) {
					this.resultChart.getData().color = COLOR.UP;
				} else {
					this.resultChart.getData().color = COLOR.DOWN;
				}

				this.resultChart.invalidateRawData();
			} else {
				this.baseChart.getData().value = mainDataValue;

				if (this.count === 0) {
					this.baseChart.getData().baseValue = this.startBaseValue;
				}
				if (mainDataValue >= this.startBaseValue) {
					this.baseChart.getData().color = COLOR.UP;
				} else {
					this.baseChart.getData().color = COLOR.DOWN;
				}
				this.baseChart.invalidateRawData();
			}

			document.querySelector('#current-value').textContent = mainDataValue || value3;
			this.count++;
		}
	}
}

class BaseChart {
	private rightSeries: am4charts.ColumnSeries;
	private leftValueAxis: am4charts.ValueAxis;
	private readonly rightValueAxis: am4charts.ValueAxis;
	private chart: am4charts.XYChart;

	constructor(containerId: string, initData: any[], position: string, min: number, max: number) {
		const chart = am4core.create(containerId, am4charts.XYChart);
		chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect
		chart.data = initData;
		chart.responsive.enabled = false;
		chart.paddingLeft = 0;
		chart.paddingRight = 0;

		const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.renderer.grid.template.location = 0;
		categoryAxis.renderer.grid.template.disabled = true;
		categoryAxis.renderer.inside = true;
		categoryAxis.dataFields.category = 'base';
		categoryAxis.renderer.minGridDistance = 5;
		categoryAxis.hidden = true;

		const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.renderer.labels.template.disabled = true;
		valueAxis.renderer.grid.template.disabled = true;
		valueAxis.renderer.inside = true;
		valueAxis.cursorTooltipEnabled = false;
		valueAxis.strictMinMax = true;

		valueAxis.min = min;
		valueAxis.max = max;

		if (position === 'left') {
			this.leftValueAxis = valueAxis;
		} else {
			this.rightValueAxis = valueAxis;
		}

		const series = chart.series.push(new am4charts.ColumnSeries());
		series.dataFields.categoryX = 'base';
		series.dataFields.valueY = 'value';
		series.dataFields.openValueY = 'baseValue';
		series.fixedWidthGrid = true;
		series.columns.template.propertyFields.fill = 'color';
		series.columns.template.propertyFields.stroke = 'color';
		series.columns.template.width = am4core.percent(100);

		this.rightSeries = series;

		series.columns.template.events.on('validated', (ev) => {
			ev.target.fill = am4core.color(chart.data[0].color);
			ev.target.stroke = am4core.color(chart.data[0].color);
			this.leftValueAxis.min = min;
			this.leftValueAxis.max = max;
			if (this.rightValueAxis) {
				this.rightValueAxis.min = min;
				this.rightValueAxis.max = max;
			}
		});
	}

	public invalidateRawData(): void {
		this.chart.invalidateRawData();
	}

	public getData(): any {
		return this.chart.data[0];
	}

	public getChart(): am4charts.XYChart {
		return this.chart;
	}
}

class ResultChart {
	private rightSeries: am4charts.ColumnSeries;
	private leftValueAxis: am4charts.ValueAxis;
	private readonly rightValueAxis: am4charts.ValueAxis;
	private chart: am4charts.XYChart;

	constructor(containerId: string, initData: any[], position: string, min: number, max: number) {
		const chart = am4core.create(containerId, am4charts.XYChart);
		chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect
		chart.data = initData;
		chart.responsive.enabled = false;
		chart.paddingLeft = 0;
		chart.paddingRight = 0;

		const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.renderer.grid.template.location = 0;
		categoryAxis.renderer.grid.template.disabled = true;
		categoryAxis.renderer.inside = true;
		categoryAxis.dataFields.category = 'base';
		categoryAxis.renderer.minGridDistance = 5;
		categoryAxis.hidden = true;

		const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.renderer.labels.template.disabled = true;
		valueAxis.renderer.grid.template.disabled = true;
		valueAxis.renderer.inside = true;
		valueAxis.cursorTooltipEnabled = false;
		valueAxis.strictMinMax = true;

		valueAxis.min = min;
		valueAxis.max = max;

		if (position === 'left') {
			this.leftValueAxis = valueAxis;
		} else {
			this.rightValueAxis = valueAxis;
		}

		const series = chart.series.push(new am4charts.ColumnSeries());
		series.dataFields.categoryX = 'base';
		series.dataFields.valueY = 'value';
		series.dataFields.openValueY = 'baseValue';
		series.fixedWidthGrid = true;
		series.columns.template.propertyFields.fill = 'color';
		series.columns.template.propertyFields.stroke = 'color';
		series.columns.template.width = am4core.percent(100);

		this.rightSeries = series;

		series.columns.template.events.on('validated', (ev) => {
			ev.target.fill = am4core.color(chart.data[0].color);
			ev.target.stroke = am4core.color(chart.data[0].color);
			this.leftValueAxis.min = min;
			this.leftValueAxis.max = max;
			if (this.rightValueAxis) {
				this.rightValueAxis.min = min;
				this.rightValueAxis.max = max;
			}
		});
	}

	public invalidateRawData(): void {
		this.chart.invalidateRawData();
	}

	public getData(): any {
		return this.chart.data[0];
	}

	public getChart(): am4charts.XYChart {
		return this.chart;
	}
}

class MainChart {
	private readonly chart: am4charts.XYChart;
	private readonly resultLine: am4charts.LineSeries;
	private readonly baseLine: am4charts.LineSeries;
	private bullet: am4charts.CircleBullet;
	private leftBaseValue: number = 0;
	private baseValue: number = 0;

	constructor(containerId: string, initValue: number) {
		this.chart = this.makeChart(containerId, initValue);
		this.makeCategoryAxis();
		this.makeValueAxis();
		this.makeMaxSeries();
		this.makeMinSeries();
		this.baseLine = this.makeBaseSeries();
		this.resultLine = this.makeResultSeries();
		this.bullet = this.makeBullet();
	}

	public addData(rawDataItem: Object | Object[], removeCount: number): void {
		this.chart.addData(rawDataItem, removeCount);
	}

	public invalidateRawData(): void {
		this.chart.invalidateRawData();
	}

	public getChart() {
		return this.chart;
	}

	public getBaseLine() {
		return this.baseLine;
	}

	public getResultLine() {
		return this.resultLine;
	}

	private generateData(initValue: number): any {
		const result = [];
		for (let i = 0; i < 120; i++) {
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
	}

	private makeChart(containerId: string, initValue: number): am4charts.XYChart {
		const chart: am4charts.XYChart = am4core.create(containerId, am4charts.XYChart);
		chart.paddingLeft = 0;
		chart.paddingRight = 0;
		chart.language.locale = am4lang_ko_KR;

		chart.data = this.generateData(initValue);
		return chart;
	}

	private makeCategoryAxis(): am4charts.CategoryAxis {
		const categoryAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
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
	}

	private makeValueAxis(): am4charts.ValueAxis {
		const valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.renderer.inside = true;
		valueAxis.renderer.labels.template.disabled = true;
		valueAxis.renderer.grid.template.disabled = true;
		valueAxis.cursorTooltipEnabled = false;
		valueAxis.strictMinMax = true;
		return valueAxis;
	}

	private makeMaxSeries(): am4charts.LineSeries {
		const series = this.chart.series.push(new am4charts.LineSeries());
		series.dataFields.categoryX = 'time';
		series.dataFields.valueY = 'value1';
		series.strokeWidth = 1;
		series.stroke = am4core.color('#dfdfdf');
		series.strokeOpacity = 0.3;
		series.tensionX = 0.8;
		series.connect = false;
		return series;
	}

	private makeMinSeries(): am4charts.LineSeries {
		const series = this.chart.series.push(new am4charts.LineSeries());
		series.dataFields.categoryX = 'time';
		series.dataFields.valueY = 'value2';
		series.strokeWidth = 1;
		series.stroke = am4core.color('#dfdfdf');
		series.strokeOpacity = 0.3;
		series.tensionX = 0.8;
		series.connect = false;
		return series;
	}

	private makeBaseSeries(): am4charts.LineSeries {
		const series = this.chart.series.push(new am4charts.LineSeries());
		series.dataFields.categoryX = 'time';
		series.dataFields.valueY = 'value';
		series.strokeWidth = 2;
		series.tensionX = 0.8;
		series.connect = false;
		series.stroke = am4core.color('#28df40');
		return series;
	}

	private makeResultSeries(): am4charts.LineSeries {
		const series = this.chart.series.push(new am4charts.LineSeries());
		series.dataFields.categoryX = 'time';
		series.dataFields.valueY = 'value3';
		series.strokeWidth = 2;
		series.tensionX = 0.8;
		series.connect = false;
		series.stroke = am4core.color('#32CD32');
		return series;
	}

	private makeBasePoint(): am4charts.CircleBullet {
		const bullet = this.resultLine.bullets.push(new am4charts.CircleBullet());
		bullet.circle.fill = am4core.color(COLOR.UP);
		bullet.circle.strokeWidth = 2;
		bullet.circle.propertyFields.radius = 'townSize';
		return bullet;
	}

	private makeBullet(): am4charts.CircleBullet {
		const bullet = this.baseLine.createChild(am4charts.CircleBullet);
		bullet.circle.radius = 7;
		bullet.fillOpacity = 2;
		bullet.fill = am4core.color(COLOR.DOWN);
		bullet.strokeOpacity = 0;
		bullet.isMeasured = false;
		return bullet;
	}

	private setupEvent() {
		this.baseLine.events.on('validated', () => {
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
		});

		this.resultLine.events.on('validated', () => {
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
		});
	}
}

class TrendLine {
	private readonly trendLine: am4charts.LineSeries;

	constructor(parentChart: MainChart, max: number, min: number, basePoint: number) {
		const trend = parentChart.getChart().series.push(new am4charts.LineSeries());
		trend.dataFields.valueY = 'value';
		trend.dataFields.categoryX = 'time';
		trend.strokeWidth = 2;
		trend.stroke = am4core.color('#afab58');
		trend.data = [{ time: basePoint, value: max }, { time: basePoint, value: min }];

		this.trendLine = trend;
	}

	public getLine(): am4charts.LineSeries {
		return this.trendLine;
	}
}

class ResultLine {
	private readonly resultLine: am4charts.LineSeries;

	constructor(parentChart: MainChart, max: number, min: number, basePoint: number, baseValue: number) {
		const resultBaseLine = parentChart.getChart().series.push(new am4charts.LineSeries());
		resultBaseLine.dataFields.valueY = 'value';
		resultBaseLine.dataFields.categoryX = 'time';
		resultBaseLine.strokeWidth = 2;
		resultBaseLine.strokeOpacity = 0.5;
		resultBaseLine.stroke = am4core.color('#dfdfdf');
		resultBaseLine.data = [{ time: basePoint, value: baseValue }, { time: 119, value: baseValue }];

		const resultDynamicLine = parentChart.getChart().series.push(new am4charts.LineSeries());
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
	}

	public getLine(): am4charts.LineSeries {
		return this.resultLine;
	}
}
