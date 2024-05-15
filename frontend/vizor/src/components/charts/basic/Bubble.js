import React, { useEffect } from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

function Bubble({ data, categoryField, valueFields }) {

	useEffect(() => {

		var chart = am4core.create("bubble", am4charts.XYChart);
		chart.data = data;

		var valueAxisx = chart.xAxes.push(new am4charts.ValueAxis());
		valueAxisx.title.text = valueFields[0];
		const minimumXValue = Math.min(...data.map(item => item[valueFields[0]]));
		valueAxisx.min = minimumXValue;

		var valueAxisy = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxisy.title.text = valueFields[1];
		const minimumYValue = Math.min(...data.map(item => item[valueFields[1]]));
		valueAxisy.min = minimumYValue;

		var series = chart.series.push(new am4charts.LineSeries());
		series.dataFields.valueX = valueFields[0];
		series.dataFields.valueY = valueFields[1];
		series.dataFields.value = valueFields[2];
		series.strokeOpacity = 0;
		series.sequencedInterpolation = true;
		series.tooltip.pointerOrientation = "vertical";

		var bullet = series.bullets.push(new am4core.Circle());
		bullet.fill = am4core.color("#0c0");
		bullet.propertyFields.fill = "color";
		bullet.strokeWidth = 2;
		bullet.strokeOpacity = 0;
		bullet.fillOpacity = 0.5;
		bullet.stroke = am4core.color("#fff");
		bullet.hiddenState.properties.scale = 0;
		bullet.tooltipText = categoryField + `: {${categoryField}}\n` + valueFields[0] + `: {valueX}\n` + valueFields[1] + `: {valueY}\n` + valueFields[2] + `: {value}`;

		var hoverState = bullet.states.create("hover");
		hoverState.properties.fillOpacity = 1;
		hoverState.properties.strokeOpacity = 1;

		series.heatRules.push({ target: bullet, min: 2, max: 60, property: "radius" });

		bullet.adapter.add("tooltipY", function (tooltipY, target) {
			return -target.radius;
		});

		chart.cursor = new am4charts.XYCursor();
		chart.cursor.behavior = "panXY";

		chart.cursor.events.on("hit", function (ev) {
			var series = ev.target.series;
			if (series) {
				var dataItem = series.tooltipDataItem;
				series.showTooltipAt(dataItem);
			}
		});

		chart.mouseWheelBehavior = "zoomXY";

		chart.scrollbarX = new am4core.Scrollbar();
		chart.scrollbarY = new am4core.Scrollbar();

		chart.logo.disabled = true;

		return () => {
			chart.dispose();
		}
	}, [data, categoryField, valueFields]);

	return (
		<>
			<div id="bubble" style={{ width: "100%", height: "600px" }}></div>
			<div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", backgroundColor: "#ccc", paddingTop: "10px", borderRadius: "10px" }}>
				<p><strong>Can't see your chart/seeing too much?</strong> Try adding a filter or a limit.</p>
			</div>
		</>
	);
}

export default Bubble;