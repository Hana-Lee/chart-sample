App.main = (function() {
	am4core.useTheme(am4themes_animated);
	am4core.useTheme(am4themes_dark);

	return {
		count: 0,
		basePoint: 58,
		startPointBaseValue: 0,
		endPoint: 119,
		endPointBaseValue: 0,
		mainChart: undefined,
		baseChart: undefined,
		resultChart: undefined,
		timeInterval: undefined,
		breakTime: false,
		currentState: App.BIN_PROC.NONE,

		start: function() {
			// if (navigator.platform.toLowerCase() === 'win32') {
			// 	if (!window.sessionStorage.getItem('5fe0f262363b515a31f074dfc76d6351')) {
			// 		App.DummyChart.init();
			// 		return;
			// 	}
			// }
			var socket = io.connect(location.href);
			socket.on('priceData', this.dataReceivedHandler.bind(this));
			// var item = localStorage.getItem('lhn');
			// item = JSON.parse(item);
			// item.state = 2;
			// this.dataReceivedHandler(item);
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
		 * @param priceData.avgPriceList number[]
		 * @param priceData.biPriceList number[]
		 * @param priceData.ixPriceList number[]
		 * @param priceData.startCheck number
		 * @param priceData.startMinPrice number
		 * @param priceData.startMaxPrice number
		 * @param priceData.state number NONE, START, OPEN, RESULT
		 */
		dataReceivedHandler: function(priceData) {
			this.currentState = priceData.state;

			console.log('price data', priceData);
			console.log('start check', priceData.startCheck, ':', priceData.startCheck / 1000);
			console.log('state', priceData.state, 'max', priceData.startMinPrice);

			if (this.currentState === App.BIN_PROC.NONE || !priceData.avgPrice) {
				return;
			}
			// if (App.main.isBreakTime()) {
			// 	return;
			// }

			var breakTimeLeft = Math.floor(priceData.startCheck / 1000) - 120;
			console.log('breakTimeLeft', breakTimeLeft, breakTimeLeft>=30);
			if (priceData.state === App.BIN_PROC.RESULT) {
				localStorage.setItem('lhn', JSON.stringify(priceData));
				if (breakTimeLeft >= 30) {
					this.showProgressImage(breakTimeLeft);
				} else {
					this.showBaseValueOverlay(priceData);
					this.showResultValueOverlay(priceData);
				}

				return;
			}

			if (App.main.hasNotMainChart()) {
				App.main.screenClear();
				App.main.resetState();
				App.main.prepareMainChart(priceData);
				App.main.prepareBaseChart(priceData);
				this.count = priceData.avgPriceList.length > 0 ? priceData.avgPriceList.length - 1 : 0;

				if (this.count > 0 && this.startPointBaseValue === 0) {
					this.startPointBaseValue = priceData.avgPriceList[0];
					this.baseChart.setBasePointValue(this.startPointBaseValue);
				}
				if (this.count >= this.basePoint && this.endPointBaseValue === 0) {
					console.log('priceData.avgPriceList[this.basePoint]', priceData.avgPriceList[this.basePoint]);
					this.endPointBaseValue = priceData.avgPriceList[this.basePoint];
				}

				if (this.count > this.basePoint) {
					this.showBaseValueOverlay({ixPrice:priceData.ixPriceList[this.basePoint], biPrice: priceData.biPriceList[this.basePoint], avgPrice: priceData.avgPriceList[this.basePoint]});
					App.main.prepareResultChart(priceData);
					this.resultChart.setBasePointValue(this.endPointBaseValue);
					console.log('this.endPointBaseValue', this.endPointBaseValue);
					this.mainChart.makeResultLine(this.endPointBaseValue);
				}
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
			} else if (this.count <= this.basePoint) {
				this.baseChart.setBasePointValue(this.startPointBaseValue);
				this.baseChart.updateData(priceData);
			}

			this.updateCurrentValueElem(priceData.avgPrice);

			if (this.isLastCount()) {
				setTimeout(function() {
					this.gameOver(priceData);
				}.bind(this), 1);
			}

			this.count++;
		},

		gameOver: function(priceData) {
			this.breakTime = true;
			this.showResultValueOverlay(priceData);
			setTimeout(function() {
				this.showProgressImage();
			}.bind(this), 29000);
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
			this.baseChart = new App.UpDownChart('base_chart_div', priceData, 'left');
		},

		prepareResultChart: function(priceData) {
			this.resultChart = new App.UpDownChart('result_chart_div', priceData, 'right');
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

		isBasePointCount: function() {
			return this.count === this.basePoint;
		},

		isResultAreaCount: function() {
			return this.count > this.basePoint;
		},

		addResultChart: function(priceData) {
			this.resultChart = new App.UpDownChart('result_chart_div', priceData, 'right');
		},

		showBaseValueOverlay: function(priceData) {
			this.showValueOverlay('#main_overlay .mid.base_value_group', priceData);
			this.enableBaseValueOverlay();
		},

		showResultValueOverlay: function(priceData) {
			this.showValueOverlay('#main_overlay .mid.result_value_group', priceData);
			this.updateHighAndLowLabel(priceData);
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

		updateHighAndLowLabel: function(priceData) {
			var highAndLowLabel = 'HIGH';
			var highAndLowClassName = ' up';
			if (this.endPointBaseValue > priceData.avgPrice) {
				highAndLowLabel = 'LOW';
				highAndLowClassName = ' down';
			}
			var highAndLowElem = document.querySelector('#main_overlay .result_value_group .high_low_text');
			highAndLowElem.textContent = highAndLowLabel;
			highAndLowElem.className = highAndLowElem.className.replace(/\sup|\sdown/, '');
			highAndLowElem.className += highAndLowClassName;
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
			var breakTimeOverlay = document.querySelector('#break_time_overlay');
			breakTimeOverlay.style.display = 'none';
			var imageElem = breakTimeOverlay.querySelector('.image');
			imageElem.style.width = '100%';
			var counterElem = breakTimeOverlay.querySelector('.label');
			counterElem.textContent = '29초 후 시작합니다.';
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

		showProgressImage: function(leftTime) {
			this.hideMainOverlay();
			this.disposeAllChart();

			var breakTimeOverlay = document.querySelector('#break_time_overlay');
			var imageElem = breakTimeOverlay.querySelector('.image');
			var counterElem = breakTimeOverlay.querySelector('.label');
			if (breakTimeOverlay.style.display === '' || breakTimeOverlay.style.display === 'none') {
				breakTimeOverlay.style.display = 'block';
				var count = 0;
				if (!_.isNil(leftTime)) {
					count = leftTime - 30;
					imageElem.style.width = (100 - (3.4 * count)) + '%';
					counterElem.textContent = (60 - leftTime) + '초 후 시작';
				}
				var imageInterval = setInterval(function() {
					if (count === 29) {
						clearInterval(imageInterval);
						this.breakTime = false;
						return false;
					}
					var width = imageElem.style.width.replace('%', '');
					if (count < 29) {
						imageElem.style.width = Number(width) - 3.4 + '%';
					} else {
						imageElem.style.width = '0%';
					}
					var counter = counterElem.textContent.replace('초 후 시작', '');
					counter = (counter - 1) + '초 후 시작';
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
