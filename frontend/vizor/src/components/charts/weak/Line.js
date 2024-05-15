import React, { useState, useEffect } from "react";
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

function Line({ data, categoryFields, valueField }) {

	const [truncate, setTruncate] = useState(false);

	useEffect(() => {

		var chart = am4core.create("line", am4charts.XYChart);

		chart.data = data;

		data.forEach(item => {
			item[categoryFields[1]] = item[categoryFields[1]].toString();
		});

		var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.dataFields.category = categoryFields[1];
		categoryAxis.title.text = categoryFields[1];

		var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.title.text = valueField;

		const groupedData = {};
		data.forEach((item) => {
			if (!groupedData[item[categoryFields[0]]]) {
				groupedData[item[categoryFields[0]]] = [];
			}
			groupedData[item[categoryFields[0]]].push(item);
		});

		Object.keys(groupedData).forEach((key, index) => {

			if ((index >= 20 && truncate) || (!truncate && index >= 100)) {
				return;
			}

			let line = chart.series.push(new am4charts.LineSeries());
			line.dataFields.valueY = valueField;
			line.dataFields.categoryX = categoryFields[1];
			line.name = key;
			line.data = groupedData[key];
			line.tooltipText = "{name}: [bold]{valueY}[/]";
			line.strokeWidth = 2;
		});

		chart.legend = new am4charts.Legend();
		chart.legend.position = "right";
		chart.legend.scrollable = true;

		chart.cursor = new am4charts.XYCursor();
		chart.cursor.behavior = "zoomXY";

		chart.mouseWheelBehavior = "panX";

		chart.scrollbarX = new am4core.Scrollbar();
		chart.scrollbarY = new am4core.Scrollbar();

		chart.logo.disabled = true;

		return () => {
			chart.dispose();
		}

	}, [data, categoryFields, valueField, truncate]);

	return (
		<>
			<div id="line" style={{ width: "100%", height: "600px" }}></div>
			<div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "50px", backgroundColor: "#ccc", paddingTop: "10px", borderRadius: "10px" }}>
				<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
					<p><strong>Can't see your chart/seeing too much?</strong></p>
					<p>Try adding a filter, a limit, or press TRUNCATE to enforce the proposed cardinality limit: <strong>20</strong>. A cardinality limit of 100 has already been auto-enforced for chart processing safety.</p>
				</div>
				{truncate ? <button className='btn red-btn' onClick={() => setTruncate(false)}>USE ALL DATA</button> : <button className='btn' onClick={() => setTruncate(true)}>TRUNCATE</button>}
			</div>
		</>
	);
}

export default Line;