import React, { useEffect } from "react";
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4forceDirected from '@amcharts/amcharts4/plugins/forceDirected';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

function CirclePacking({ data, categoryFields, valueField }) {

    useEffect(() => {

        var chart = am4core.create("circle-packing", am4forceDirected.ForceDirectedTree);
        chart.hiddenState.properties.opacity = 0;

        var transformedData = [];
        
        var pks = [];
        data.forEach(item => {
            if (!pks.includes(item[categoryFields[0]]) && pks.length <= 10) {
                pks.push(item[categoryFields[0]]);
            }
        });

        console.log(pks);

        pks.forEach(key1 => {
            transformedData.push({
                name: key1,
                children: []
            })
        });
        
        console.log(transformedData);
        
        data.forEach(item => {
            transformedData.forEach(group => {
                if (group.name === item[categoryFields[0]] && group.children.length <= 20) {
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

        chart.logo.disabled = true;

        return () => {
            chart.dispose();
        }

    }, [data, categoryFields, valueField]);

    return (
        <div id="circle-packing" style={{ width: "100%", height: "700px" }}></div>
    );
}

export default CirclePacking;