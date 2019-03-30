(function () {
	var min = 3901;
	var max = 3908;
	var startBaseValue = null;
	var leftBaseValue = null;
	var rightBaseValue = null;
	var basePoint = 30;
	var baseValue = 0;
	var valueAxis = null;
	var rightSeries = null;
	var leftSeries = null;
	var isSettingCompleted = false;
	var isSettingCompleted2 = false;

	function generateData(initValue) {
		var result = [];
		for (var i = 0; i < 60; i++) {
			result.push({
				time: i, value: i === 0 ? initValue : null, openValue: initValue, value1: null, value2: null, timeText: '', townSize: 0,
				value3: null,
				value4: null,
				startBaseTime: i,
				endBaseTime: i,
				startBaseValue: null,
				endBaseValue: null,
			});
		}
		return result;
	}

	function makeCenterChart(initValue) {
		var chart = am4core.create('chart_div', am4charts.XYChart);
		// chart.paddingRight = 20;
		chart.paddingLeft = 0;
		chart.paddingRight = 0;
		chart.columnSpace = 0;
		// chart.colors.step = 3;

		chart.data = generateData(initValue);

		var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.dataFields.category = 'time';
		categoryAxis.dataFields.text = 'timeText';
		categoryAxis.renderer.minGridDistance = 10;
		categoryAxis.tooltip.disabled = true;
		categoryAxis.renderer.grid.template.disabled = true;
		categoryAxis.renderer.inside = true;
		categoryAxis.renderer.labels.template.disabled = true;

		categoryAxis.renderer.grid.template.location = 0.5;
		categoryAxis.startLocation = 0.5;
		categoryAxis.endLocation = 0.5;

		valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.renderer.inside = true;
		valueAxis.renderer.labels.template.disabled = true;
		valueAxis.renderer.grid.template.disabled = true;
		valueAxis.cursorTooltipEnabled = false;
		valueAxis.min = min;
		valueAxis.max = max;
		valueAxis.strictMinMax = true;

		var data1Series = chart.series.push(new am4charts.LineSeries());
		data1Series.dataFields.categoryX = 'time';
		data1Series.dataFields.valueY = 'value1';
		data1Series.strokeWidth = 1;
		data1Series.tensionX = 0.8;
		data1Series.connect = false;
		// data1Series.fill = am4core.color('#cfcfcf');
		// data1Series.stroke = am4core.color('#cfcfcf');

		var series = chart.series.push(new am4charts.LineSeries());
		series.dataFields.categoryX = 'time';
		series.dataFields.valueY = 'value';
		series.strokeWidth = 1;
		series.tensionX = 0.8;
		series.connect = false;
		// series.stroke = am4core.color('#ff4c4a');
		series.fill = am4core.color('#ff4c4a');

		var series2 = chart.series.push(new am4charts.LineSeries());
		series2.dataFields.categoryX = 'time';
		series2.dataFields.valueY = 'value3';
		series2.strokeWidth = 1;
		series2.tensionX = 0.8;
		series2.connect = false;
		// series2.stroke = am4core.color('#ff4c4a');
		series2.fill = am4core.color('#ff4c4a');

		// Add bullets
		var latitudeBullet = series2.bullets.push(new am4charts.CircleBullet());
		latitudeBullet.circle.fill = am4core.color('#ff4c4a');
		latitudeBullet.circle.strokeWidth = 2;
		latitudeBullet.circle.propertyFields.radius = 'townSize';

		var data2Series = chart.series.push(new am4charts.LineSeries());
		data2Series.dataFields.categoryX = 'time';
		data2Series.dataFields.valueY = 'value2';
		data2Series.strokeWidth = 1;
		data2Series.tensionX = 0.8;
		data2Series.connect = false;
		// data2Series.fill = am4core.color('#acbea3');
		// data2Series.stroke = am4core.color('#acbea3');

		// bullet at the front of the line
		var bullet = series2.createChild(am4charts.CircleBullet);
		bullet.circle.radius = 7;
		bullet.fillOpacity = 1;
		bullet.fill = am4core.color('#007bff');
		bullet.strokeOpacity = 0;
		bullet.isMeasured = false;

		series.events.on('validated', function () {
			if (series.dataItems.last.valueY) {
				if (series.dataItems.last.valueY >= leftBaseValue) {
					bullet.fill = am4core.color('#ff4c4a');
				} else {
					bullet.fill = am4core.color('#007bff');
				}
				bullet.storke = bullet.fill;
				bullet.moveTo(series.dataItems.last.point);
				bullet.validatePosition();
			}

			if (!isSettingCompleted && leftBaseValue) {
				var range = valueAxis.createSeriesRange(series);
				range.value = leftBaseValue;
				range.endValue = max;
				range.contents.stroke = am4core.color("#ff4c4a");
				range.contents.fill = range.contents.stroke;
				isSettingCompleted = true;
			}
		});

		series2.events.on('validated', function () {
			if (series2.dataItems.last.valueY) {
				if (series2.dataItems.last.valueY >= baseValue) {
					bullet.fill = am4core.color('#ff4c4a');
				} else {
					bullet.fill = am4core.color('#007bff');
				}
				bullet.storke = bullet.fill;
				bullet.moveTo(series2.dataItems.last.point);
				bullet.validatePosition();
			}

			if (!isSettingCompleted2 && baseValue) {
				var range = valueAxis.createSeriesRange(series2);
				range.value = baseValue;
				range.endValue = max;
				range.contents.stroke = am4core.color("#ff4c4a");
				range.contents.fill = range.contents.stroke;
				isSettingCompleted2 = true;
			}
		});

		return chart;
	}

	function makeSideChart(chartContainer, chartData) {
		var chart = am4core.create(chartContainer, am4charts.XYChart);
		chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect
		chart.data = chartData;
		chart.columnSpace = 0;
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

		var series = chart.series.push(new am4charts.ColumnSeries());
		series.dataFields.categoryX = 'base';
		series.dataFields.valueY = 'value';
		series.dataFields.openValueY = 'baseValue';
		series.fixedWidthGrid = true;
		series.columns.template.propertyFields.fill = "color";
		series.columns.template.propertyFields.stroke = "color";
		series.columns.template.width = am4core.percent(100);

		rightSeries = series;

		// series.columns.template.strokeOpacity = 0;
		// series.columns.template.fillOpacity = 0.75;

		// var columnTemplate = series.columns.template;
		// columnTemplate.strokeOpacity = 0;
		// columnTemplate.propertyFields.fill = 'color';
		// columnTemplate.width = am4core.percent(100);

// Add distinctive colors for each column using adapter
// 		series.columns.template.adapter.add('fill', function (fill, target) {
// 			console.log('fill');
// 			return chart.colors.getIndex(target.dataItem.index);
// 		});
		series.columns.template.events.on('validated', function (ev) {
			// if (chart.data[0].value >= chart.data[0].baseValue) {
			ev.target.fill = am4core.color(chart.data[0].color);
			ev.target.stroke = am4core.color(chart.data[0].color);
			// } else {
			// 	ev.target.fill = am4core.color('#007bff')
			// }
		});
		return chart;
	}

	var mainChart = null;
	var leftChart = null;
	var rightChart = null;
	var intervalId;

	function createTrendLine() {
		var trend = mainChart.series.push(new am4charts.LineSeries());
		trend.dataFields.valueY = 'value';
		trend.dataFields.categoryX = 'time';
		trend.strokeWidth = 1;
		trend.stroke = am4core.color('#afab58');
		trend.data = [{ time: basePoint, value: min }, { time: basePoint, value: max }];
	}

	function createTrendLine2() {
		var trend2 = mainChart.series.push(new am4charts.LineSeries());
		trend2.dataFields.valueY = 'value';
		trend2.dataFields.categoryX = 'time';
		trend2.strokeWidth = 1;
		trend2.strokeOpacity = 0.5;
		trend2.stroke = am4core.color('#dfdfdf');
		trend2.data = [{ time: basePoint, value: baseValue }, { time: 59, value: baseValue }];

		var trend3 = mainChart.series.push(new am4charts.LineSeries());
		trend3.dataFields.valueY = 'value';
		trend3.dataFields.categoryX = 'time';
		trend3.dataFields.openValueY = 'baseValue';
		trend3.fillOpacity = 0.2;
		// trend3.fill = am4core.color('#ff4c4a');
		// trend3.fill = am4core.color('#007bff');
		trend3.propertyFields.fill = "color";
		trend3.propertyFields.stroke = "color";
		trend3.strokeWidth = 1;
		trend3.strokeOpacity = 0.5;
		// trend3.stroke = am4core.color('#dfdfdf');
		trend3.data = [
			{ time: basePoint, value: baseValue, baseValue: baseValue, color: '#007bff' },
			{ time: 59, value: baseValue, baseValue: baseValue, color: '#007bff' },
		];

		return trend3;

		// var bullet = trend2.bullets.push(new am4charts.CircleBullet());
		// bullet.strokeWidth = 2;
		// bullet.stroke = am4core.color('#fff');
		// bullet.circle.fill = trend2.stroke;
	}

	function startInterval() {
		var count = 0;
		var endBaseValue = null;
		var trendLine = null;
		if (mainChart) {
			mainChart.data = generateData();
		}
		intervalId = setInterval(function () {
			axios.get('data', { params: { index: count } }).then(function (res) {
				var data = res.data;
				var data1Value = Number(data.data1.value);
				var data2Value = Number(data.data2.value);
				var mainDataValue = ((data1Value + data2Value) / 2).toFixed(2);
				if (!mainChart) {
					mainChart = window.lhn = makeCenterChart(mainDataValue);
					createTrendLine();
				}
				if (!leftChart) {
					leftChart = makeSideChart('left_chart_div', [{ 'base': 'One', 'value': mainDataValue, baseValue: mainDataValue, color: '#ff4c4a' }]);
				}
				if (count === 60) {
					document.querySelector('#result-value').textContent = mainDataValue;
					clearInterval(intervalId);
					return false;
				}

				var townSize = 0;
				var timeText = '';
				if (count === basePoint) {
					if (!rightChart) {
						rightChart = makeSideChart('right_chart_div', [{
							'base': 'One',
							'value': mainDataValue,
							baseValue: mainDataValue,
							color: '#ff4c4a'
						}]);
					}
					townSize = 8;
				}
				if (count <= 0 || count === basePoint || count === 59) {
					timeText = data.data1.time;
				}
				var time = count;
				var startBaseTime = count;
				var endBaseTime = count;
				var value3 = null;
				var value4 = null;
				if (count === 0) {
					startBaseValue = mainDataValue;
					leftBaseValue = mainDataValue;
				}
				if (count < basePoint) {
					startBaseTime = 0;
				}
				if (count === basePoint) {
					endBaseValue = mainDataValue;
					baseValue = mainDataValue;
				}
				if (count >= basePoint) {
					endBaseTime = 59;
				}
				if (trendLine) {
					trendLine.data[0].value = mainDataValue;
					trendLine.data[1].value = mainDataValue;
					if (mainDataValue >= baseValue) {
						trendLine.data[0].color = '#ff4c4a';
						trendLine.data[1].color = '#ff4c4a';
					} else {
						trendLine.data[0].color = '#007bff';
						trendLine.data[1].color = '#007bff';
					}
					trendLine.invalidateRawData();
				}

				if (count >= basePoint) {
					value3 = mainDataValue;
				}
				if (count > basePoint) {
					mainDataValue = null;
					leftBaseValue = null;
				}

				mainChart.addData({
					time: time,
					value: mainDataValue,
					value3: value3,
					townSize: townSize,
					timeText: timeText,
					value1: data.data1.value,
					value2: data.data2.value,
					startBaseTime: startBaseTime,
					endBaseTime: endBaseTime,
					startBaseValue: startBaseValue,
					endBaseValue: endBaseValue,
				}, true);
				mainChart.invalidateRawData();

				if (count > basePoint) {
					rightChart.data[0].value = value3;
					if (count === basePoint) {
						rightBaseValue = value3;
						rightChart.data[0].baseValue = rightBaseValue;
					}
					if (value3 >= rightBaseValue) {
						rightChart.data[0].color = '#ff4c4a';
					} else {
						rightChart.data[0].color = '#007bff';
					}

					rightChart.invalidateRawData();
				} else {
					// if (count > basePoint) {
					// 	leftChart.data[0].value = value3;
					// } else {
						leftChart.data[0].value = mainDataValue;
					// }

					if (count === 0) {
						leftChart.data[0].baseValue = startBaseValue;
					}
					if (mainDataValue >= startBaseValue) {
						leftChart.data[0].color = '#ff4c4a';
					} else {
						leftChart.data[0].color = '#007bff';
					}
					leftChart.invalidateRawData();
					// rightChart.invalidateData();
				}

				document.querySelector('#current-value').textContent = mainDataValue;
				if (count === basePoint) {
					trendLine = createTrendLine2();
					document.querySelector('#base-value').textContent = mainDataValue;
				}
				count++;
			});
		}, 2000);
	}

	var timeInterval = null;

	function startTimeInterval() {
		timeInterval = setInterval(function () {
			document.querySelector('#current-time').textContent = moment().format('HH:mm:ss');
		}, 1000);
	}

	function endTimeInterval() {
		if (timeInterval) {
			clearInterval(timeInterval);
		}
	}

	function stopInterval() {
		clearInterval(intervalId);
	}

	document.querySelector('#start-interval').addEventListener('click', function () {
		showOverlay();
		startInterval();
	});

	document.querySelector('#current-time').addEventListener('click', function () {
		stopInterval();
	});

	// startInterval();
	startTimeInterval();
}());

function showOverlay() {
	document.querySelector('#overlay').style.display = 'block';
	setTimeout(function () {
		overlayOff();
	}, 1000);
}

function overlayOff() {
	document.querySelector('#overlay').style.display = 'none';
}
