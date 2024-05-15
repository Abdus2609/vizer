import React, { useEffect } from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

function Scatter({ data, categoryField, valueFields }) {

	useEffect(() => {

		var chart = am4core.create("scatter", am4charts.XYChart);
		chart.data = data;

		var valueAxisX = chart.xAxes.push(new am4charts.ValueAxis());
		valueAxisX.title.text = valueFields[0];
		const minimumXValue = Math.min(...data.map(item => item[valueFields[0]]));
		valueAxisX.min = minimumXValue;

		var valueAxisY = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxisY.title.text = valueFields[1];
		const minimumYValue = Math.min(...data.map(item => item[valueFields[1]]));
		valueAxisY.min = minimumYValue;

		var series = chart.series.push(new am4charts.LineSeries());
		series.dataFields.valueX = valueFields[0];
		series.dataFields.valueY = valueFields[1];

		series.strokeOpacity = 0;
		series.sequencedInterpolation = true;

		var bullet = series.bullets.push(new am4core.Circle());
		bullet.fill = am4core.color("#0c0");
		bullet.strokeWidth = 2;
		bullet.strokeOpacity = 0;
		bullet.fillOpacity = 0.5;
		bullet.stroke = am4core.color("#fff");
		bullet.hiddenState.properties.scale = 0;
		bullet.radius = 5;

		bullet.tooltipText = categoryField + `: {${categoryField}}\n` + valueFields[0] + `: {valueX}\n` + valueFields[1] + `: {valueY}`;

		var hoverState = bullet.states.create("hover");
		hoverState.properties.fillOpacity = 1;
		hoverState.properties.strokeOpacity = 1;

		chart.cursor = new am4charts.XYCursor();
		chart.cursor.behavior = "zoomXY";

		chart.mouseWheelBehavior = "panX";

		chart.logo.disabled = true;

		chart.scrollbarX = new am4core.Scrollbar();
		chart.scrollbarY = new am4core.Scrollbar();

		return () => {
			chart.dispose();
		};
	}, [data, categoryField, valueFields]);

	return (
		<>
			<div id="scatter" style={{ width: "100%", height: "600px" }}></div>
			<div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", backgroundColor: "#ccc", paddingTop: "10px", borderRadius: "10px" }}>
				<p><strong>Can't see your chart/seeing too much?</strong> Try adding a filter or a limit.</p>
			</div>
		</>
	);
}

export default Scatter;