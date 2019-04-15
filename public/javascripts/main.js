App.main = (function() {
	am4core.useTheme(am4themes_animated);
	am4core.useTheme(am4themes_dark);

	return {
		count: 0,
		basePoint: 59,
		startPointBaseValue: 0,
		endPoint: 119,
		endPointBaseValue: 0,
		mainChart: undefined,
		baseChart: undefined,
		resultChart: undefined,
		timeInterval: undefined,
		breakTime: false,

		start: function() {
			// if (navigator.platform.toLowerCase() === 'win32') {
			// 	if (!window.sessionStorage.getItem('5fe0f262363b515a31f074dfc76d6351')) {
			// 		App.DummyChart.init();
			// 		return;
			// 	}
			// }
			var socket = io.connect(location.href);
			socket.on('priceData', this.dataReceivedHandler.bind(this));
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
			if (App.main.isBreakTime()) {
				return;
			}

			if (App.main.hasNotMainChart()) {
				App.main.screenClear();
				App.main.resetState();
				App.main.prepareMainChart(priceData);
				App.main.prepareBaseChart(priceData);
			} else {
				App.main.updateData(priceData);
			}
		},

		isBreakTime: function() {
			return this.breakTime;
		},

		screenClear: function() {
			this.hideMainOverlay();
			this.hideBreakTimeOverlay();
		},

		updateData: function(priceData) {
			if (this.count === 0) {
				this.startPointBaseValue = priceData.avgPrice;
			}

			if (this.isLastCount()) {
				this.gameOver(priceData);
				return;
			}

			if (this.isBasePointCount()) {
				this.endPointBaseValue = priceData.avgPrice;

				setTimeout(function() {
					this.showBaseValueOverlay(priceData);
				}.bind(this), 1);

				setTimeout(function() {
					this.addResultChart(priceData);
				}.bind(this), 1);

				setTimeout(function() {
					this.mainChart.makeResultLine(priceData.avgPrice);
				}.bind(this), 1);
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
				this.resultChart.setBasePointValue(this.endPointBaseValue);
				this.resultChart.updateData(priceData);

				this.baseChart.updateMaxValue(this.mainChart.getMaxValue());
				this.baseChart.updateMinValue(this.mainChart.getMinValue());
			} else {
				this.baseChart.setBasePointValue(this.startPointBaseValue);
				this.baseChart.updateData(priceData);
			}

			this.updateCurrentValueElem(priceData.avgPrice);
			this.count++;
		},

		gameOver: function(priceData) {
			this.breakTime = true;
			this.showResultValueOverlay(priceData);
			setTimeout(function() {
				this.hideMainOverlay();
				this.disposeAllChart();
				this.showProgressImage();
			}.bind(this), 30000);
		},

		resetState: function() {
			this.count = 0;
			this.startPointBaseValue = 0;
			this.endPointBaseValue = 0;
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
			return this.count > this.endPoint;
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
			this.enableBaseValueOverlay();
		},

		showResultValueOverlay: function(priceData) {
			this.showValueOverlay('#main_overlay .mid.result_value_group', priceData);
			this.disableBaseValueOverlay();
		},

		disableBaseValueOverlay: function() {
			if (document.querySelector('#main_overlay .mid.base_value_group table .base .label').className.indexOf('disable') === -1) {
				document.querySelector('#main_overlay .mid.base_value_group table .base .label').className += ' disable';
				document.querySelector('#main_overlay .mid.base_value_group table .binance .label').className += ' disable';
				document.querySelector('#main_overlay .mid.base_value_group table .idax .label').className += ' disable';
			}
		},

		enableBaseValueOverlay: function() {
			document.querySelector('#main_overlay .mid.base_value_group table .base .label').className =
				document.querySelector('#main_overlay .mid.base_value_group table .base .label').className.replace(' disable', '');

			document.querySelector('#main_overlay .mid.base_value_group table .binance .label').className =
				document.querySelector('#main_overlay .mid.base_value_group table .binance .label').className.replace(' disable', '');

			document.querySelector('#main_overlay .mid.base_value_group table .idax .label').className =
				document.querySelector('#main_overlay .mid.base_value_group table .idax .label').className.replace(' disable', '');
		},

		showValueOverlay: function(elemSelector, priceData) {
			var overlayElem = document.querySelector(elemSelector);
			if (overlayElem.style.display === '' || overlayElem.style.display === 'none') {
				var binanceValueElem = overlayElem.querySelector('.binance .value');
				var idaxValueElem = overlayElem.querySelector('.idax .value');
				var resultValueElem = overlayElem.querySelector('.base .value');
				binanceValueElem.textContent = priceData.biPrice.toFixed(2);
				idaxValueElem.textContent = priceData.ixPrice.toFixed(2);
				resultValueElem.textContent = priceData.avgPrice.toFixed(2);
				overlayElem.style.display = 'block';
			}
		},

		hideMainOverlay: function() {
			var midOverlays = document.querySelectorAll('#main_overlay .mid');
			midOverlays[0].style.display = 'none';
			midOverlays[1].style.display = 'none';
		},

		hideBreakTimeOverlay: function() {
			document.querySelector('#break_time_overlay').style.display = 'none';
		},

		disposeAllChart: function() {
			if (this.mainChart) {
				this.mainChart.getChart().dispose();
			}

			if (this.baseChart) {
				this.baseChart.getChart().dispose();
			}

			if (this.resultChart) {
				this.resultChart.getChart().dispose();
			}
			this.mainChart = undefined;
			this.baseChart = undefined;
			this.resultChart = undefined;
		},

		showProgressImage: function() {
			var breakTimeOverlay = document.querySelector('#break_time_overlay');
			var imageElem = breakTimeOverlay.querySelector('.image');
			var counterElem = breakTimeOverlay.querySelector('.label');
			if (breakTimeOverlay.style.display === '' || breakTimeOverlay.style.display === 'none') {
				breakTimeOverlay.style.display = 'block';
				var count = 1;
				var imageInterval = setInterval(function() {
					if (count === 31) {
						clearInterval(imageInterval);
						this.breakTime = false;
						return false;
					}
					var width = imageElem.style.width.replace('%', '');
					if (count < 30) {
						imageElem.style.width = Number(width) - 3.3 + '%';
					} else {
						imageElem.style.width = '0%';
					}
					var counter = counterElem.textContent.replace('초', '');
					counter = (counter - 1) + '초';
					counterElem.textContent = counter;
					count++;
				}.bind(this), 1000);
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
