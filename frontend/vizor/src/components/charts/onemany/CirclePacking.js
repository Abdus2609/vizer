import React, { useState, useEffect } from "react";
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4forceDirected from '@amcharts/amcharts4/plugins/forceDirected';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

function CirclePacking({ data, categoryFields, valueField }) {

	const [truncate, setTruncate] = useState(false);

	useEffect(() => {

		var chart = am4core.create("circle-packing", am4forceDirected.ForceDirectedTree);
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
			pks = pks.filter((_item, index) => index < 50);

		pks.forEach(key1 => {
			transformedData.push({
				name: key1,
				children: []
			})
		});

		data.forEach(item => {
			transformedData.forEach(group => {
				if (group.name === item[categoryFields[0]]) {
					if ((!truncate && group.children.length < 50) || (truncate && group.children.length < 20))
						group.children.push({
							name: item[categoryFields[1]],
							value: item[valueField]
						});
				}
			});
		});

		chart.data = transformedData;

		var networkSeries = chart.series.push(new am4forceDirected.ForceDirectedSeries());
		networkSeries.dataFields.linkWith = "linkWith";
		networkSeries.dataFields.name = "name";
		networkSeries.dataFields.id = "name";
		networkSeries.dataFields.value = "value";
		networkSeries.dataFields.children = "children";
		networkSeries.links.template.distance = 1;
		networkSeries.nodes.template.tooltipText = "{name}: [bold]{value}[/]";
		networkSeries.nodes.template.fillOpacity = 1;
		networkSeries.nodes.template.outerCircle.scale = 1;

		networkSeries.nodes.template.label.text = "{name}"
		networkSeries.fontSize = 8;
		networkSeries.nodes.template.label.hideOversized = true;
		networkSeries.nodes.template.label.truncate = true;
		networkSeries.minRadius = am4core.percent(2);
		networkSeries.manyBodyStrength = -5;
		networkSeries.links.template.strokeOpacity = 0;

		chart.legend = new am4charts.Legend();
		chart.legend.position = "right";
		chart.legend.scrollable = true;
		chart.legend.background.fill = am4core.color("#fff");

		chart.logo.disabled = true;

		return () => {
			chart.dispose();
		}

	}, [data, categoryFields, valueField, truncate]);

	return (
		<>
			<div id="circle-packing" style={{ width: "100%", height: "600px" }}></div>
			<div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "50px", backgroundColor: "#ccc", paddingTop: "10px", borderRadius: "10px" }}>
				<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
					<p><strong>Can't see your chart/seeing too much?</strong></p>
					<p>Try adding a filter, a limit, or press TRUNCATE to enforce the proposed cardinality limit: <strong>20</strong>. A cardinality limit of 50 has already been auto-enforced for chart processing safety.</p>
				</div>
				{truncate ? <button className='btn red-btn' onClick={() => setTruncate(false)}>USE ALL DATA</button> : <button className='btn' onClick={() => setTruncate(true)}>TRUNCATE</button>}
			</div>
		</>
	);
}

export default CirclePacking;