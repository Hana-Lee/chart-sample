App.main = (function() {
	am4core.useTheme(am4themes_animated);
	am4core.useTheme(am4themes_dark);

	return {
		count: 0,
		min: 0,
		max: 0,
		basePoint: 60,
		startBaseValue: 0,
		resultBaseValue: 0,
		endPoint: 120,
		basePointValue: 0,
		mainChart: undefined,
		baseChart: undefined,
		resultChart: undefined,
		resultLine: undefined,
		timeInterval: undefined,

		start: function() {
			// if (navigator.platform.toLowerCase() === 'win32') {
			// 	if (!window.sessionStorage.getItem('5fe0f262363b515a31f074dfc76d6351')) {
			// 		App.DummyChart.init();
			// 		return;
			// 	}
			// }
			var socket = io.connect(location.href);
			socket.on('priceData', this.dataReceivedHandler);
			App.main.startTimer();
		},

		/**
		 * Websocket Data 수신 핸들러.
		 * @param priceData object
		 * @param priceData.avgPrice number
		 * @param priceData.maxPrice number
		 * @param priceData.minPrice number
		 * @param priceData.biPrice number
		 * @param priceData.ixPrice number
		 */
		dataReceivedHandler: function(priceData) {
			if (App.main.hasNotMainChart()) {
				App.main.prepareMainChart(priceData);
				App.main.prepareBaseChart(priceData);
			} else {
				App.main.updateData(priceData);
			}
		},

		updateData: function(priceData) {
			if (this.isLastCount()) {
				this.updateResultValueElem(priceData.avgPrice);
				this.showResultValueOverlay(priceData);
				return;
			}

			if (this.isBasePointCount()) {
				this.basePointValue = priceData.avgPrice;
				this.showBaseValueOverlay(priceData);
				this.updateBaseValueElem(priceData.avgPrice);
				this.addResultChart(priceData);
				this.mainChart.makeResultLine(priceData.avgPrice);
			}

			if (this.isResultAreaCount()) {
				this.mainChart.updateResultLineData(priceData.avgPrice, this.basePointValue);
			}

			var newData = {
				point: this.count,
				avgValue: priceData.avgPrice,
				townSize: this.isBasePointCount() ? 7 : 0,
				binValue: priceData.biPrice,
				idxValue: priceData.ixPrice,
				startBaseTime: this.count,
				endBaseTime: this.count,
				startBaseValue: this.startBaseValue,
				endBaseValue: this.basePointValue,
			};

			this.mainChart.addData(newData, true);

			if (this.isResultAreaCount()) {
				this.resultChart.setBasePointValue(priceData.avgPrice);
				this.resultChart.updateData(priceData);

				this.baseChart.updateMaxValue(this.mainChart.getMaxValue());
				this.baseChart.updateMinValue(this.mainChart.getMinValue());
			} else {
				this.baseChart.setBasePointValue(priceData.avgPrice);
				this.baseChart.updateData(priceData);
			}

			this.updateCurrentValueElem(priceData.avgPrice);
			this.count++;
		},

		hasNotMainChart: function() {
			return this.mainChart === undefined;
		},

		prepareMainChart: function(priceData) {
			this.mainChart = new App.MainChart('main_chart_div', priceData);
		},

		getMainChart: function() {
			return this.mainChart;
		},

		prepareBaseChart: function(priceData) {
			this.baseChart = new App.UpDownChart('base_chart_div', priceData);
		},

		getBasePoint: function() {
			return this.basePoint;
		},

		getEndPoint: function() {
			return this.endPoint;
		},

		startTimer: function() {
			this.timeInterval = setInterval(function() {
				// document.querySelector('#current-time').textContent = moment().format('HH:mm:ss');
			}, 1000);
		},

		stopTimer: function() {
			clearInterval(this.timeInterval);
		},

		isLastCount: function() {
			return this.count === this.endPoint;
		},

		updateResultValueElem: function(value) {
			// document.querySelector('#result-value').textContent = value + '';
		},

		updateBaseValueElem: function(value) {
			// document.querySelector('#base-value').textContent = value + '';
		},

		isBasePointCount: function() {
			return this.count === this.basePoint;
		},

		isResultAreaCount: function() {
			return this.count >= this.basePoint;
		},

		addResultChart: function(priceData) {
			this.resultChart = new App.UpDownChart('result_chart_div', priceData);
		},

		showBaseValueOverlay: function(priceData) {
			// this.showValueOverlay('#base_value_overlay', priceData);
		},

		showResultValueOverlay: function(priceData) {
			// this.showValueOverlay('#result_value_overlay', priceData);
		},

		showValueOverlay: function(elemSelector, priceData) {
			var overlayElem = document.querySelector(elemSelector);
			if (overlayElem.style.display === '') {
				var binanceValueElem = overlayElem.querySelector('.binance .value');
				var idaxValueElem = overlayElem.querySelector('.idax .value');
				var resultValueElem = overlayElem.querySelector('.base .value');
				binanceValueElem.textContent = priceData.biPrice.toFixed(2);
				idaxValueElem.textContent = priceData.ixPrice.toFixed(2);
				resultValueElem.textContent = priceData.avgPrice.toFixed(2);
				overlayElem.style.display = 'block';
			}
		},

		updateCurrentValueElem: function(value) {
			// document.querySelector('#current-value').textContent = value.toFixed(2);
		},

		updateSideChartMinMaxValue: function() {
			this.baseChart.updateMaxValue(this.mainChart.getMaxValue());
			this.baseChart.updateMinValue(this.mainChart.getMinValue());
			if (this.resultChart) {
				this.resultChart.updateMaxValue(this.mainChart.getMaxValue());
				this.resultChart.updateMinValue(this.mainChart.getMinValue());
			}
		},
	};
}());
