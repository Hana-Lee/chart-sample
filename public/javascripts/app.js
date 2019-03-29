(function () {
	am4core.useTheme(am4themes_animated);
	am4core.useTheme(am4themes_dark);
	var min = 3901;
	var max = 3908;
	function generateData() {
		var result = [];
		for (var i = 0; i < 60; i++) {
			result.push({
				time: i, value: null, value1: null, value2: null, timeText: i, townSize: 0,
				value3: null,
				value4: null,
				startBaseTime: i,
				endBaseTime: i,
				startBaseValue: null,
				endBaseValue: null
			});
		}
		return result;
	}

	function makeCenterChart() {
		var chart = am4core.create('chart_div', am4charts.XYChart);
		// chart.paddingRight = 20;
		chart.paddingLeft = 2;
		chart.paddingRight = 20;
		chart.colors.step = 3;

		chart.data = generateData();

		var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.dataFields.category = 'time';
		categoryAxis.dataFields.text = 'timeText';
		categoryAxis.renderer.minGridDistance = 10;
		categoryAxis.hidden = false;
		categoryAxis.tooltip.disabled = true;
		categoryAxis.renderer.grid.template.disabled = true;
		categoryAxis.renderer.inside = true;

		var data1ValueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		data1ValueAxis.renderer.inside = true;
		data1ValueAxis.renderer.labels.template.disabled = true;
		data1ValueAxis.renderer.grid.template.disabled = true;
		data1ValueAxis.cursorTooltipEnabled = false;
		data1ValueAxis.min = min;
		data1ValueAxis.max = max;
		data1ValueAxis.renderer.opposite = false;
		data1ValueAxis.strictMinMax = true;

		var data1Series = chart.series.push(new am4charts.LineSeries());
		data1Series.dataFields.categoryX = 'time';
		data1Series.dataFields.valueY = 'value1';
		data1Series.strokeWidth = 2;
		data1Series.tensionX = 0.8;
		data1Series.connect = false;




		var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.renderer.inside = true;
		valueAxis.renderer.labels.template.disabled = true;
		valueAxis.renderer.grid.template.disabled = false;
		valueAxis.cursorTooltipEnabled = false;
		valueAxis.min = min;
		valueAxis.max = max;
		valueAxis.renderer.opposite = false;
		valueAxis.strictMinMax = true;

		var series = chart.series.push(new am4charts.LineSeries());
		series.dataFields.categoryX = 'time';
		series.dataFields.valueY = 'value';
		series.strokeWidth = 4;
		series.tensionX = 0.8;
		series.connect = false;

		// Add bullets
		var latitudeBullet = series.bullets.push(new am4charts.CircleBullet());
		latitudeBullet.circle.fill = am4core.color('#ff4c4a');
		latitudeBullet.circle.strokeWidth = 2;
		latitudeBullet.circle.propertyFields.radius = 'townSize';




		var data2ValueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		data2ValueAxis.renderer.inside = true;
		data2ValueAxis.renderer.labels.template.disabled = true;
		data2ValueAxis.renderer.grid.template.disabled = true;
		data2ValueAxis.cursorTooltipEnabled = false;
		data2ValueAxis.min = min;
		data2ValueAxis.max = max;
		data2ValueAxis.strictMinMax = true;
		data2ValueAxis.renderer.opposite = false;

		var data2Series = chart.series.push(new am4charts.LineSeries());
		data2Series.dataFields.categoryX = 'time';
		data2Series.dataFields.valueY = 'value2';
		data2Series.strokeWidth = 2;
		data2Series.tensionX = 0.8;
		data2Series.connect = false;

		/* Create series */
		var columnSeries = chart.series.push(new am4charts.ColumnSeries());
		columnSeries.name = "Income1";
		columnSeries.dataFields.valueY = "value3";
		columnSeries.dataFields.categoryX = "startBaseTime";
		columnSeries.dataFields.openValueY = "startBaseValue";

		/* Create series */
		var columnSeries2 = chart.series.push(new am4charts.ColumnSeries());
		columnSeries2.name = "Income2";
		columnSeries2.dataFields.valueY = "value4";
		columnSeries2.dataFields.categoryX = "endBaseTime";
		columnSeries2.dataFields.openValueY = "endBaseValue";

		// bullet at the front of the line
		var bullet = series.createChild(am4charts.CircleBullet);
		bullet.circle.radius = 7;
		bullet.fillOpacity = 1;
		bullet.fill = chart.colors.getIndex(0);
		bullet.isMeasured = false;

		series.events.on("validated", function() {
			bullet.moveTo(series.dataItems.last.point);
			bullet.validatePosition();
		});

		return chart;
	}

	function makeSideChart(chartContainer, chartData) {
		var chart = am4core.create(chartContainer, am4charts.XYChart);
		chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect
		chart.data = chartData;
		chart.padding = 0;
		chart.columnSpace = 0;
		chart.responsive.enabled = true;
		chart.paddingLeft = 0;
		chart.paddingRight = 0;

		var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.renderer.grid.template.location = 0;
		categoryAxis.renderer.grid.template.disabled = false;
		categoryAxis.renderer.inside = true;
		categoryAxis.dataFields.category = 'base';
		categoryAxis.renderer.minGridDistance = 5;
		categoryAxis.hidden = true;

		var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.renderer.labels.template.disabled = true;
		valueAxis.renderer.inside = true;
		valueAxis.cursorTooltipEnabled = false;
		valueAxis.strictMinMax = true;


		valueAxis.min = min;
		valueAxis.max = max;

		var series = chart.series.push(new am4charts.ColumnSeries());
		series.dataFields.categoryX = 'base';
		series.dataFields.valueY = 'value';
		series.dataFields.openValueY = "baseValue";
		series.fixedWidthGrid = true;
		// series.columns.template.strokeOpacity = 0;
		// series.columns.template.fillOpacity = 0.75;

		var columnTemplate = series.columns.template;
		columnTemplate.strokeOpacity = 0;
		columnTemplate.propertyFields.fill = "color";
		columnTemplate.width = am4core.percent(100);

// Add distinctive colors for each column using adapter
// 		series.columns.template.adapter.add('fill', function (fill, target) {
// 			return chart.colors.getIndex(target.dataItem.index);
// 		});
		return chart;
	}

	var mainChart = window.lhn = makeCenterChart();
	var leftChart = makeSideChart('left_chart_div', [{ 'base': 'One', 'value': 0, baseValue: 0 }]);
	var rightChart = makeSideChart('right_chart_div', [{ 'base': 'One', 'value': 0, baseValue: 0 }]);
	var intervalId;

	function createTrendLine() {
		var trend = mainChart.series.push(new am4charts.LineSeries());
		trend.dataFields.valueY = "value";
		trend.dataFields.categoryX = "time";
		trend.strokeWidth = 2;
		trend.stroke = am4core.color("#c00");
		trend.data = [{
			time: 30, value: min,
		},{
			time: 30, value: max,
		}];

		var bullet = trend.bullets.push(new am4charts.CircleBullet());
		bullet.strokeWidth = 2;
		bullet.stroke = am4core.color("#fff");
		bullet.circle.fill = trend.stroke;
	}
	function startInterval() {
		var count = 0;
		var startBaseValue = null;
		var endBaseValue = null;
		mainChart.data = generateData();
		intervalId = setInterval(function () {
			axios.get('data', { params: { index: count } }).then(function (res) {
				var data = res.data;
				var data1Value = Number(data.data1.value);
				var data2Value = Number(data.data2.value);
				var mainDataValue = ((data1Value + data2Value) / 2).toFixed(2);

				if (count === 60) {
					document.querySelector('#result-value').textContent = mainDataValue;
					clearInterval(intervalId);
					return false;
				}

				var townSize = 0;
				var timeText = '';
				if (count === 30) {
					townSize = 8;
				}
				if (count <= 0 || count === 30 || count === 59) {
					timeText = data.data1.time;
				}
				var time = count;
				var startBaseTime = count;
				var endBaseTime = count;
				var value3 = null;
				var value4 = null;
				if (count === 0) {
					startBaseValue = mainDataValue;
				}
				if (count < 30) {
					startBaseTime = 0;
					value3 = mainDataValue;
				}
				if (count === 30) {
					endBaseValue = mainDataValue;
				}
				if (count >= 30) {
					endBaseTime = 59;
					value4 = mainDataValue;
				}
				mainChart.addData({
					time: time,
					value: mainDataValue,
					townSize: townSize,
					timeText: timeText,
					value1: data.data1.value,
					value2: data.data2.value,
					value3: value3,
					value4: value4,
					startBaseTime: startBaseTime,
					endBaseTime: endBaseTime,
					startBaseValue: startBaseValue,
					endBaseValue: endBaseValue
				}, true);
				mainChart.invalidateRawData();

				if (count < 30) {
					leftChart.data[0].value = mainDataValue;
					if (count === 0) {
						leftChart.data[0].baseValue = startBaseValue;
					}
					leftChart.invalidateRawData();
				} else {
					rightChart.data[0].value = mainDataValue;
					if (count === 30) {
						rightChart.data[0].baseValue = mainDataValue;
					}
					rightChart.invalidateRawData();
				}

				document.querySelector('#current-value').textContent = mainDataValue;
				if (count === 30) {
					createTrendLine();
					document.querySelector('#base-value').textContent = mainDataValue;
				}
				count++;
			});
		}, 500);
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
