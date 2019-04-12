App.main = (function() {
	am4core.useTheme(am4themes_animated);
	am4core.useTheme(am4themes_dark);

	var socket = io.connect(location.href);

	var ResultLine = {
		resultLine: 0,

		init: function(parentChart, max, min, basePoint, baseValue) {
			var resultBaseLine = parentChart.getChart().series.push(new am4charts.LineSeries());
			resultBaseLine.dataFields.valueY = 'value';
			resultBaseLine.dataFields.categoryX = 'point';
			resultBaseLine.strokeWidth = 2;
			resultBaseLine.strokeOpacity = 0.5;
			resultBaseLine.stroke = am4core.color('#dfdfdf');
			resultBaseLine.data = [{ point: basePoint, value: baseValue }, { point: 119, value: baseValue }];

			var resultDynamicLine = parentChart.getChart().series.push(new am4charts.LineSeries());
			resultDynamicLine.dataFields.valueY = 'value';
			resultDynamicLine.dataFields.categoryX = 'point';
			resultDynamicLine.dataFields.openValueY = 'baseValue';
			resultDynamicLine.fillOpacity = 0.1;
			resultDynamicLine.propertyFields.fill = 'color';
			resultDynamicLine.propertyFields.stroke = 'color';
			resultDynamicLine.strokeWidth = 1;
			resultDynamicLine.strokeOpacity = 0.5;
			resultDynamicLine.data = [
				{ point: basePoint, value: baseValue, baseValue: baseValue, color: App.COLOR.DOWN },
				{ point: 119, value: baseValue, baseValue: baseValue, color: App.COLOR.DOWN },
			];

			this.resultLine = resultDynamicLine;

			return this;
		},

		getLine: function() {
			return this.resultLine;
		},
	};

	return {
		count: 0,
		min: 0,
		max: 0,
		basePoint: 60,
		startBaseValue: 0,
		resultBaseValue: 0,
		endCount: 119,
		basePointValue: 0,
		mainChart: undefined,
		baseChart: undefined,
		resultChart: undefined,
		resultLine: undefined,
		timeInterval: undefined,

		hasNotMainChart: function() {
			return this.mainChart === undefined;
		},

		addMainChart: function(mainChart) {
			this.mainChart = mainChart;
		},

		getMainChart: function() {
			return this.mainChart;
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

		getBasePoint: function() {
			return this.basePoint;
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
			this.resultChart = new App.UpDownChart('result_chart_div', [{
				'base': 'One',
				'value': initValue,
				baseValue: initValue,
				color: App.COLOR.UP,
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

		/**
		 *
		 * @param data object
		 * @param data.avgPrice number
		 * @param data.maxPrice number
		 * @param data.minPrice number
		 * @param data.biPrice number
		 * @param data.ixPrice number
		 */
		updateData: function(data) {
			if (this.count === this.endCount) {
				return;
			}
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
				this.mainChart.makeResultLine(data.avgPrice);
			}

			if (this.isResultAreaCount()) {
				this.mainChart.updateResultLineData(data.avgPrice, this.basePointValue);
			}

			var newData = {
				point: this.count,
				value: data.avgPrice,
				townSize: this.isBasePointCount() ? 8 : 0,
				value1: data.biPrice,
				value2: data.ixPrice,
				startBaseTime: this.count,
				endBaseTime: this.count,
				startBaseValue: this.startBaseValue,
				endBaseValue: this.basePointValue,
			};
			this.mainChart.addData(newData, true);

			if (this.isResultAreaCount()) {
				this.resultChart.setBasePointValue(data.avgPrice);
				this.resultChart.updateData(data);
			} else {
				this.baseChart.setBasePointValue(data.avgPrice);
				this.baseChart.updateData(data);
			}
			this.updateCurrentValueElem(data.avgPrice);
			this.count++;
		},

		start: function() {
			App.main.startTimer();

			/**
			 * Websocket Data 수신 핸들러.
			 * @param priceData object
			 * @param priceData.avgPrice number
			 * @param priceData.maxPrice number
			 * @param priceData.minPrice number
			 */
			function dataReceiveHandler(priceData) {
				if (App.main.hasNotMainChart()) {

					App.main.addMainChart(new App.MainChart('main_chart_div', priceData));
					App.main.addBaseChart(new App.UpDownChart('base_chart_div', [{
						'base': 'One',
						'value': priceData.avgPrice,
						baseValue: priceData.avgPrice,
						color: App.COLOR.UP,
					}], priceData.maxPrice, priceData.minPrice));
				}

				setTimeout(function() {
					App.main.updateData(priceData);
				}, 200);
			}

			socket.on('priceData', dataReceiveHandler.bind(this));
		},
	};
}());
