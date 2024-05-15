import React, { useState, useEffect } from "react";
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

function Chord({ data, categoryFields, valueField }) {

	const [truncate, setTruncate] = useState(false);

	useEffect(() => {

		var chart = am4core.create("chord", am4charts.ChordDiagram);
		chart.hiddenState.properties.opacity = 0;

		var truncatedData = [];

		var k1s = {};

		data.forEach(item => {
			if (!Object.keys(k1s).includes(item[categoryFields[0]])) {
				k1s[item[categoryFields[0]]] = 0;
			}
		});

		if (truncate) {
			const newK1s = {};
			let index = 0;

			for (const key in k1s) {
				if (index < 20) {
					newK1s[key] = k1s[key];
				}
				index++;
			}

			k1s = newK1s;
		}

		data.forEach(item => {
			if (Object.keys(k1s).includes(item[categoryFields[0]])) {
				if (!truncate || k1s[item[categoryFields[0]]] < 20) {
					truncatedData.push(item);
					k1s[item[categoryFields[0]]] += 1;
				}
			}
		});

		chart.data = truncatedData;

		chart.dataFields.fromName = categoryFields[0];
		chart.dataFields.toName = categoryFields[1];
		chart.dataFields.value = valueField;

		let link = chart.links.template;
		link.fillOpacity = 0.8;

		chart.logo.disabled = true;

		return () => {
			chart.dispose();
		}

	}, [data, categoryFields, valueField, truncate]);

	return (
		<>
			<div id="chord" style={{ width: "100%", height: "600px" }}></div>
			<div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", backgroundColor: "#ccc", paddingTop: "10px", borderRadius: "10px" }}>
				<p><strong>Can't see your chart/seeing too much?</strong> Try adding a filter, a limit, or press TRUNCATE to enforce the proposed cardinality limit: <strong>20</strong></p>
				{truncate ? <button className='btn red-btn' onClick={() => setTruncate(false)}>USE ALL DATA</button> : <button className='btn' onClick={() => setTruncate(true)}>TRUNCATE</button>}
			</div>
		</>
	);

}

export default Chord;