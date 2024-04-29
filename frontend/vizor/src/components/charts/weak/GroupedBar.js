import React, { useEffect } from "react";
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

function GroupedBar({ data, categoryFields, valueField }) {

    useEffect(() => {

        // clustered bar chart

        var chart = am4core.create("chord", am4charts.XYChart);

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

        console.log(groupedData);

        Object.keys(groupedData).forEach((key, index) => {

            if (index >= 20) {
                return;
            }

            let series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = valueField;
            series.dataFields.categoryX = categoryFields[1];
            series.name = key;
            series.data = groupedData[key].filter((_item, index) => index < 20);
            series.tooltipText = "{name}: [bold]{valueY}[/]";
            series.stacked = false;
            series.sequencedInterpolation = true;

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

    }, [data, categoryFields, valueField]);

    return (
        <div id="chord" style={{ width: "100%", height: "700px" }}></div>
    );
}

export default GroupedBar;