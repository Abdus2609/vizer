import React, { useEffect } from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

function Choropleth({ data, categoryField, valueField }) {

	useEffect(() => {

		console.log(categoryField);
		console.log(valueField);

		var transformedData = [];

		transformedData = data.map(item => {
			return {
				id: item[categoryField],
				value: item[valueField]
			}
		});

		var chart = am4core.create("choropleth", am4maps.MapChart);

		chart.geodata = am4geodata_worldLow;

		chart.projection = new am4maps.projections.Miller();

		var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
		polygonSeries.useGeodata = true;

		polygonSeries.data = transformedData;

		var polygonTemplate = polygonSeries.mapPolygons.template;
		polygonTemplate.tooltipText = "{name}: {value}";
		polygonTemplate.nonScalingStroke = true;
		polygonTemplate.strokeWidth = 0.5;

		polygonSeries.heatRules.push({
			property: "fill",
			target: polygonSeries.mapPolygons.template,
			min: am4core.color("#00ff00"),
			max: am4core.color("#ff0000")
		});

		var hs = polygonTemplate.states.create("hover");
		hs.properties.fill = am4core.color("#3c5bdc");

		console.log(polygonSeries.data)

		return () => {
			chart.dispose();
		};

	}, [data, categoryField, valueField]);

	return (
		<>
			<div id="choropleth" style={{ width: "100%", height: "600px" }}></div>
			<div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", backgroundColor: "#ccc", paddingTop: "10px", borderRadius: "10px" }}>
				<p><strong>Can't see your chart/seeing too much?</strong> Try adding a filter or a limit.</p>
			</div>
		</>
	);
}

export default Choropleth;