import React, { useEffect } from "react";
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

function TreeMap({ data, categoryFields, valueField }) {

    useEffect(() => {

        var chart = am4core.create("treemap", am4charts.TreeMap);
        chart.hiddenState.properties.opacity = 0;

        var transformedData = [];

        var pks = [];
        data.forEach(item => {
            if (!pks.includes(item[categoryFields[0]]) && pks.length <= 20) {
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

    }, [data, categoryFields, valueField]);


    return (
        <div id="treemap" style={{ width: "100%", height: "700px" }}></div>
    );
}

export default TreeMap;