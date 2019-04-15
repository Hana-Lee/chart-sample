App.main = (function() {
	am4core.useTheme(am4themes_animated);
	am4core.useTheme(am4themes_dark);

	return {
		count: 0,
		min: 0,
		max: 0,
		basePoint: 59,
		startPointBaseValue: 0,
		resultBaseValue: 0,
		endPoint: 119,
		endPointBaseValue: 0,
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
			if (this.count === 0) {
				this.startPointBaseValue = priceData.avgPrice;
			}

			if (this.isLastCount()) {
				this.showResultValueOverlay(priceData);
				return;
			}

			if (this.isBasePointCount()) {
				this.endPointBaseValue = priceData.avgPrice;
				this.showBaseValueOverlay(priceData);
				this.addResultChart(priceData);
				this.mainChart.makeResultLine(priceData.avgPrice);
			}

			if (this.isResultAreaCount()) {
				this.mainChart.updateResultLineData(priceData.avgPrice, this.endPointBaseValue);
			}

			var newData = {
				point: this.count,
				avgValue: priceData.avgPrice,
				townSize: this.isBasePointCount() ? 7 : 0,
				binValue: priceData.biPrice,
				idxValue: priceData.ixPrice,
				startBaseTime: this.count,
				endBaseTime: this.count,
				startPointBaseValue: this.startPointBaseValue,
				endBaseValue: this.endPointBaseValue,
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
				document.querySelector('#main_overlay .current_time .value').textContent = moment().format('HH:mm:ss');
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

		isBasePointCount: function() {
			return this.count === this.basePoint;
		},

		isResultAreaCount: function() {
			return this.count > this.basePoint;
		},

		addResultChart: function(priceData) {
			this.resultChart = new App.UpDownChart('result_chart_div', priceData);
		},

		showBaseValueOverlay: function(priceData) {
			this.showValueOverlay('#main_overlay .mid.base_value_group', priceData);
		},

		showResultValueOverlay: function(priceData) {
			this.showValueOverlay('#main_overlay .mid.result_value_group', priceData);
			document.querySelector('#main_overlay .mid.base_value_group table .base .label').className += ' disable';
			document.querySelector('#main_overlay .mid.base_value_group table .binance .label').className += ' disable';
			document.querySelector('#main_overlay .mid.base_value_group table .idax .label').className += ' disable';
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
			var priceElem = document.querySelector('#main_overlay .current_price');
			priceElem.querySelector('.value').textContent = value.toFixed(2);

			var upAndDownIcon = App.ICON.UP;
			var upAndDownClassName = 'up';
			if (this.endPointBaseValue > 0) {
				if (this.endPointBaseValue > value) {
					upAndDownIcon = App.ICON.DOWN;
					upAndDownClassName = 'down';
				}
			} else {
				if (this.startPointBaseValue > value) {
					upAndDownIcon = App.ICON.DOWN;
					upAndDownClassName = 'down';
				}
			}

			this.removeAllUpAndDownClassName(priceElem);

			priceElem.querySelector('.up_down_indicator').textContent = upAndDownIcon;
			priceElem.querySelector('.up_down_indicator').className += ' ' + upAndDownClassName;
		},

		removeAllUpAndDownClassName: function(parentElem) {
			parentElem.querySelector('.up_down_indicator').className =
				parentElem.querySelector('.up_down_indicator').className.replace(/\sup|\sdown/g, '');
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
