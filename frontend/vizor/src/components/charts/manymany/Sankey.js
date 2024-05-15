import React, { useState, useEffect } from "react";
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

function Sankey({ data, categoryFields, valueField }) {

	const [truncate, setTruncate] = useState(false);

	useEffect(() => {

		var chart = am4core.create("sankey", am4charts.SankeyDiagram);
		chart.hiddenState.properties.opacity = 0;

		var truncatedData = [];

		var k1s = {};

		data.forEach(item => {
			if (!Object.keys(k1s).includes(item[categoryFields[0]])) {
				k1s[item[categoryFields[0]]] = 0;
			}
		});

		const newK1s = {};
		let index = 0;

		for (const key in k1s) {
			if ((truncate && index < 20) || (!truncate && index < 50)) {
				newK1s[key] = k1s[key];
			}
			index++;
		}

		k1s = newK1s;

		data.forEach(item => {
			if (Object.keys(k1s).includes(item[categoryFields[0]])) {
				if ((!truncate && k1s[item[categoryFields[0]]] < 50) || k1s[item[categoryFields[0]]] < 20) {
					truncatedData.push(item);
					k1s[item[categoryFields[0]]] += 1;
				}
			}
		});

		chart.data = truncatedData;

		chart.data = truncatedData;

		chart.dataFields.fromName = categoryFields[0];
		chart.dataFields.toName = categoryFields[1];
		chart.dataFields.value = valueField;

		chart.nodePadding = 1;

		var hoverState = chart.links.template.states.create("hover");
		hoverState.properties.fillOpacity = 0.8;

		chart.logo.disabled = true;

		return () => {
			chart.dispose();
		}

	}, [data, categoryFields, valueField, truncate]);


	return (
		<>
			<div id="sankey" style={{ width: "95%", height: "600px" }}></div>
			<div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "50px", backgroundColor: "#ccc", paddingTop: "10px", borderRadius: "10px", marginTop: "10px" }}>
				<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
					<p><strong>Can't see your chart/seeing too much?</strong></p>
					<p>Try adding a filter, a limit, or press TRUNCATE to enforce the proposed cardinality limit: <strong>20</strong>. A cardinality limit of 50 has already been auto-enforced for chart processing safety.</p>
				</div>
				{truncate ? <button className='btn red-btn' onClick={() => setTruncate(false)}>USE ALL DATA</button> : <button className='btn' onClick={() => setTruncate(true)}>TRUNCATE</button>}
			</div>
		</>
	);
}

export default Sankey;