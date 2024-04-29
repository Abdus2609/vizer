import React, { useEffect } from "react";
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

function StackedBar({ data, categoryFields, valueFields }) {

    useEffect(() => {

        var chart = am4core.create("stacked-bar", am4charts.XYChart);

        chart.data = data;

        data.forEach(item => {
            item[categoryFields[1]] = item[categoryFields[1]].toString();
        });

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = categoryFields[1];
        categoryAxis.title.text = categoryFields[1];

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.title.text = valueFields[0];

        const groupedData = {};
        data.forEach((item) => {
            if (!groupedData[item[categoryFields[0]]]) {
                groupedData[item[categoryFields[0]]] = [];
            }
            groupedData[item[categoryFields[0]]].push(item);
        });

        console.log(groupedData);

        Object.keys(groupedData).forEach((key, index) => {

            if (index >= 20) {
                return;
            }

            let series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = valueFields[0];
            series.dataFields.categoryX = categoryFields[1];
            series.name = key;
            series.data = groupedData[key].filter((_item, index) => index < 20);
            series.tooltipText = "{name}: [bold]{valueY}[/]";
            series.stacked = true;
        });

        chart.legend = new am4charts.Legend();
        chart.legend.position = "right";
        chart.legend.scrollable = true;

        chart.cursor = new am4charts.XYCursor();
        chart.cursor.behavior = "zoomXY";

        chart.mouseWheelBehavior = "panX";

        chart.logo.disabled = true;

        return () => {
            chart.dispose();
        }
    }, [data, categoryFields, valueFields]);

    return (
        <div id="stacked-bar" style={{ width: "100%", height: "700px" }}></div>
    );
}

export default StackedBar;