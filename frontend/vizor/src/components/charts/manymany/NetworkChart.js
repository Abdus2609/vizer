import React, { useState, useEffect } from "react";
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4forceDirected from '@amcharts/amcharts4/plugins/forceDirected';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

function NetworkChart({ data, categoryFields }) {

    const [truncate, setTruncate] = useState(false);

    useEffect(() => {

        var chart = am4core.create("network-chart", am4forceDirected.ForceDirectedTree);
        chart.hiddenState.properties.opacity = 0;

        var transformedData = [];

        let key1Sum = 0;
        let key2Sum = 0;
        let key1Count = 0;
        let key2Count = 0;

        data.forEach(obj => {
            if (obj[categoryFields[0]] !== undefined) {
                key1Sum += obj[categoryFields[0]];
                key1Count += 1;
            }
            if (obj[categoryFields[1]] !== undefined) {
                key2Sum += obj[categoryFields[1]];
                key2Count += 1;
            }
        });

        const key1Average = key1Count ? key1Sum / key1Count : 0;
        const key2Average = key2Count ? key2Sum / key2Count : 0;

        let chosenKey = "";

        if (key1Average > key2Average) {
            chosenKey = categoryFields[0];
        } else {
            chosenKey = categoryFields[1];
        }

        var pks = [];

        data.forEach(item => {
            if (!pks.includes(item[chosenKey])) {
                pks.push(item[chosenKey]);
            }
        });

        if (truncate)
            pks = pks.filter((_item, index) => index < 20);
        else
            pks = pks.filter((_item, index) => index < 20);

        pks.forEach(key1 => {
            transformedData.push({
                name: key1,
                children: []
            })
        });

        data.forEach(item => {
            transformedData.forEach(group => {
                if (group.name === item[chosenKey]) {
                    if ((!truncate && group.children.length < 100) || (truncate && group.children.length < 20))
                        group.children.push({
                            name: item[chosenKey === categoryFields[0] ? categoryFields[1] : categoryFields[0]],
                            value: 0,
                            linkWith: [item[chosenKey === categoryFields[0] ? categoryFields[1] : categoryFields[0]]]
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
        networkSeries.nodes.template.tooltipText = "{name}: [bold]{value}[/]";
        networkSeries.nodes.template.fillOpacity = 1;
        networkSeries.nodes.template.outerCircle.scale = 1;

        networkSeries.nodes.template.label.text = "{name}"

        networkSeries.nodes.template.label.text = "{name}"
        networkSeries.fontSize = 8;

        chart.legend = new am4charts.Legend();
        chart.legend.position = "right";
        chart.legend.scrollable = true;
        chart.legend.background.fill = am4core.color("#fff");

        chart.logo.disabled = true;

        return () => {
            chart.dispose();
        }

    }, [data, categoryFields, truncate]);

    return (
        <>
            <div id="network-chart" style={{ width: "100%", height: "600px" }}></div>;
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

export default NetworkChart;
