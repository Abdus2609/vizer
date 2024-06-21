import React, { useState, useEffect } from "react";
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

function TreeMap({ data, categoryFields, valueField }) {

	const [truncate, setTruncate] = useState(false);

	useEffect(() => {

		var chart = am4core.create("treemap", am4charts.TreeMap);
		chart.hiddenState.properties.opacity = 0;

		var transformedData = [];

		var pks = [];
		data.forEach(item => {
			if (!pks.includes(item[categoryFields[0]])) {
				pks.push(item[categoryFields[0]]);
			}
		});

		if (truncate)
			pks = pks.filter((_item, index) => index < 20);
		else
			pks = pks.filter((_item, index) => index < 100);

		pks.forEach(key1 => {
			transformedData.push({
				name: key1,
				children: []
			})
		});

		data.forEach(item => {
			transformedData.forEach(group => {
				if (group.name === item[categoryFields[0]]) {
					if ((!truncate || group.children.length < 20) || (truncate && group.children.length < 100))
						group.children.push({
							name: item[categoryFields[1]],
							value: item[valueField]
						});
				}
			});
		});

		chart.data = transformedData;

		chart.dataFields.value = "value";
		chart.dataFields.name = "name";
		chart.dataFields.children = "children";

		const series = chart.series.push(new am4charts.TreeMapSeries());
		series.dataFields.value = "value";
		series.dataFields.name = "name";
		series.dataFields.children = "children";
		series.layoutAlgorithm = chart.series.push(new am4charts.TreeMapSeries());

		chart.maxLevels = 2;

		chart.legend = new am4charts.Legend();
		chart.legend.position = "right";
		chart.legend.scrollable = true;

		chart.logo.disabled = true;

		return () => {
			chart.dispose();
		}

	}, [data, categoryFields, valueField, truncate]);

	return (
		<>
			<div id="treemap" style={{ width: "100%", height: "600px" }}></div>
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

export default TreeMap;