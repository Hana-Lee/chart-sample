(function () {
	am4core.useTheme(am4themes_animated);
	am4core.useTheme(am4themes_dark);
	function generateData() {
		var result = [];
		for (var i = 0; i < 60; i++) {
			result.push({ time: i, value: null, value1: null, value2: null, timeText: i, townSize: 0 });
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

		var data1ValueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		data1ValueAxis.renderer.labels.template.disabled = true;
		data1ValueAxis.renderer.grid.template.disabled = true;
		data1ValueAxis.cursorTooltipEnabled = false;
		data1ValueAxis.min = 3901;
		data1ValueAxis.max = 3908;
		data1ValueAxis.renderer.opposite = false;

		var data1Series = chart.series.push(new am4charts.LineSeries());
		data1Series.dataFields.categoryX = 'time';
		data1Series.dataFields.valueY = 'value1';
		data1Series.strokeWidth = 2;
		data1Series.tensionX = 0.8;
		data1Series.connect = false;




		var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.renderer.labels.template.disabled = true;
		valueAxis.renderer.grid.template.disabled = false;
		valueAxis.cursorTooltipEnabled = false;
		valueAxis.min = 3901;
		valueAxis.max = 3908;
		valueAxis.renderer.opposite = false;

		var series = chart.series.push(new am4charts.LineSeries());
		series.dataFields.categoryX = 'time';
		series.dataFields.valueY = 'value';
		series.strokeWidth = 2;
		series.tensionX = 0.8;
		series.connect = false;

		// Add bullets
		var latitudeBullet = series.bullets.push(new am4charts.CircleBullet());
		latitudeBullet.circle.fill = am4core.color('#ff4c4a');
		latitudeBullet.circle.strokeWidth = 2;
		latitudeBullet.circle.propertyFields.radius = 'townSize';




		var data2ValueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		data2ValueAxis.renderer.labels.template.disabled = true;
		data2ValueAxis.renderer.grid.template.disabled = true;
		data2ValueAxis.cursorTooltipEnabled = false;
		data2ValueAxis.min = 3901;
		data2ValueAxis.max = 3908;
		data2ValueAxis.renderer.opposite = false;

		var data2Series = chart.series.push(new am4charts.LineSeries());
		data2Series.dataFields.categoryX = 'time';
		data2Series.dataFields.valueY = 'value2';
		data2Series.strokeWidth = 2;
		data2Series.tensionX = 0.8;
		data2Series.connect = false;


		return chart;
	}

	function makeSideChart(chartContainer, chartData) {
		var chart = am4core.create(chartContainer, am4charts.XYChart);
		chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect
		chart.data = chartData;

		var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.renderer.grid.template.disabled = false;
		categoryAxis.dataFields.category = 'base';
		categoryAxis.renderer.minGridDistance = 40;
		categoryAxis.hidden = true;

		var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.hidden = true;
		valueAxis.width = 0;
		valueAxis.renderer.baseGrid.disabled = true;
		valueAxis.renderer.labels.template.disabled = true;
		valueAxis.cursorTooltipEnabled = false;

		valueAxis.min = 3900;
		valueAxis.max = 3908;

		var series = chart.series.push(new am4charts.ColumnSeries());
		series.dataFields.categoryX = 'base';
		series.dataFields.valueY = 'value';
		series.columns.template.strokeOpacity = 0;
		series.columns.template.fillOpacity = 0.75;

// Add distinctive colors for each column using adapter
		series.columns.template.adapter.add('fill', function (fill, target) {
			return chart.colors.getIndex(target.dataItem.index);
		});
		return chart;
	}

	var mainChart = window.lhn = makeCenterChart();
	var leftChart = makeSideChart('left_chart_div', [{ 'base': 'One', 'value': 3903 }]);
	var rightChart = makeSideChart('right_chart_div', [{ 'base': 'One', 'value': 3906 }]);
	var intervalId;

	function startInterval() {
		var count = 0;
		mainChart.data = generateData();
		intervalId = setInterval(function () {
			console.log('count ', count);
			axios.get('data', { params: { index: count } }).then(function (res) {
				if (count === 60) {
					clearInterval(intervalId);
					return false;
				}
				var data = res.data;
				var data1Value = Number(data.data1.value);
				var data2Value = Number(data.data2.value);
				var mainDataValue = ((data1Value + data2Value) / 2).toFixed(2);
				var townSize = 0;
				var timeText = '';
				if (count === 30) {
					townSize = 5;
				}
				if (count <= 0 || count === 30 || count === 59) {
					timeText = data.data1.time;
				}
				console.log('time text', timeText);
				console.log('main data', mainDataValue, 'time', data.data1.time);
				mainChart.addData({
					time: count,
					value: mainDataValue,
					townSize: townSize,
					timeText: timeText,
					value1: data.data1.value,
					value2: data.data2.value,
				}, true);
				// mainChart.data[count].value = mainDataValue;
				// mainChart.data[count].townSize = townSize;
				// mainChart.data[count].timeText = timeText;
				// mainChart.invalidateRawData();
				// leftChart.addData(data1);
				// rightChart.addData(data2);
				console.log(data);

				count++;
			});
		}, 500);
	}

	function stopInterval() {
		clearInterval(intervalId);
	}

	document.querySelector('#start-interval').addEventListener('click', function () {
		showOverlay();
		startInterval();
	});

	document.querySelector('#stop-interval').addEventListener('click', function () {
		stopInterval();
	});

	// startInterval();
}());

function showOverlay() {
	document.querySelector('#overlay').style.display = 'block';
	setTimeout(function () {
		overlayOff();
	}, 600);
}

function overlayOff() {
	document.querySelector('#overlay').style.display = 'none';
}
