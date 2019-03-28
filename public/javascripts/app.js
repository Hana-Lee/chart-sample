(function () {
	am4core.useTheme(am4themes_animated);

	function makeCenterChart() {
		var chart = am4core.create('chart_div', am4charts.XYChart);
		// chart.paddingRight = 20;
		chart.paddingLeft = 2;
		chart.paddingRight = 20;

		chart.data = [];

		var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.dataFields.category = 'time';
		categoryAxis.dataFields.text = 'timeText';
		categoryAxis.renderer.minGridDistance = 10;
		categoryAxis.hidden = false;
		categoryAxis.tooltip.disabled = true;
		categoryAxis.renderer.grid.template.disabled = true;

		var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.renderer.labels.template.disabled = true;
		valueAxis.cursorTooltipEnabled = false;
		valueAxis.min = 3902.69;
		valueAxis.max = 3905.69;

		var series = chart.series.push(new am4charts.LineSeries());
		series.dataFields.categoryX = 'time';
		series.dataFields.valueY = 'value';
		series.strokeWidth = 2;
		series.tensionX = 0.77;

		// Add bullets
		var latitudeBullet = series.bullets.push(new am4charts.CircleBullet());
		latitudeBullet.circle.fill = am4core.color('#ff4c4a');
		latitudeBullet.circle.strokeWidth = 2;
		latitudeBullet.circle.propertyFields.radius = 'townSize';
		return chart;
	}

	function makeSideChart(chartContainer, chartData) {
		var chart = am4core.create(chartContainer, am4charts.XYChart);
		chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect
		chart.data = chartData;

		var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.renderer.grid.template.disabled = true;
		categoryAxis.dataFields.category = 'base';
		categoryAxis.renderer.minGridDistance = 40;
		categoryAxis.hidden = true;

		var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.hidden = true;
		valueAxis.width = 0;
		valueAxis.renderer.baseGrid.disabled = true;
		valueAxis.renderer.labels.template.disabled = true;
		valueAxis.cursorTooltipEnabled = false;

		valueAxis.min = 3902.69;
		valueAxis.max = 3905.69;

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

	var mainChart = makeCenterChart();
	var leftChart = makeSideChart('left_chart_div', [{ 'base': 'One', 'value': 3903 }]);
	var rightChart = makeSideChart('right_chart_div', [{ 'base': 'One', 'value': 3906 }]);

	function startInterval() {
		var count = 0;
		var interval = setInterval(function () {
				axios.get('data', { params: { index: count } }).then(function (res) {
					if (count === 93) {
						clearInterval(interval);
					} else {
						var data = res.data;
						var data1Value = Number(data.data1.value);
						var data2Value = Number(data.data2.value);
						var mainDataValue = ((data1Value + data2Value) / 2).toFixed(2);
						var townSize = 0;
						var timeText = '';
						if (count === 40) {
							townSize = 5;
						}
						if (count <= 0 || count === 40 || count === 92) {
							timeText = data.data1.time;
						}
						console.log('time text', count);
						console.log('main data', mainDataValue, 'time', data.data1.time);
						mainChart.addData({
							time: data.data1.time.replace(/:/g, ''),
							value: mainDataValue,
							townSize: townSize,
							timeText: timeText
						});
						// leftChart.addData(data1);
						// rightChart.addData(data2);
						console.log(data);

						count++;
					}
				});
		}, 800);
	}

	startInterval();
}());
