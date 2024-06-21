import React, { useState, useEffect } from "react";
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

function Spider({ data, categoryFields, valueField }) {

  const [truncate, setTruncate] = useState(false);

  useEffect(() => {

    var chart = am4core.create("spider", am4charts.RadarChart);

    chart.data = data;

    data.forEach(item => {
      item[categoryFields[1]] = item[categoryFields[1]].toString();
    });

    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = categoryFields[1];
    categoryAxis.renderer.labels.template.location = 0.5;
    categoryAxis.renderer.tooltipLocation = 0.5;
    categoryAxis.renderer.grid.template.location = 0.5;
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

    Object.keys(groupedData).forEach((key, index) => {

      if (index >= 10 && truncate) {
        return;
      }

      var series = chart.series.push(new am4charts.RadarSeries());
      series.dataFields.valueY = valueField;
      series.dataFields.categoryX = categoryFields[1];
      series.name = key;

      if (truncate)
        series.data = groupedData[key].filter((_item, index) => index < 20);
      else
        series.data = groupedData[key];

      series.tooltipText = "{name}: [bold]{valueY}[/]";
      series.sequencedInterpolation = true;

    });

    chart.scrollbarX = new am4core.Scrollbar();
    chart.scrollbarX.exportable = false;
    chart.scrollbarY = new am4core.Scrollbar();
    chart.scrollbarY.exportable = false;

    chart.cursor = new am4charts.RadarCursor();
    chart.cursor.xAxis = categoryAxis;
    chart.cursor.fullWidthXLine = true;
    chart.cursor.lineX.strokeOpacity = 0;
    chart.cursor.lineX.fillOpacity = 0.1;
    chart.cursor.lineX.fill = am4core.color("#000000");

    chart.mouseWheelBehavior = "zoomX";

    chart.legend = new am4charts.Legend();
    chart.legend.position = "right";
    chart.legend.scrollable = true;

    return () => {
      chart.dispose();
    }

  }, [data, categoryFields, valueField, truncate]);

  return (
    <>
      <div id="spider" style={{ width: "100%", height: "600px" }}></div>
      <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", backgroundColor: "#ccc", paddingTop: "10px", borderRadius: "10px" }}>
        <p><strong>Can't see your chart/seeing too much?</strong> Try adding a filter, a limit, or press TRUNCATE to enforce the proposed cardinality limit: <strong>20</strong></p>
        {truncate ? <button className='btn red-btn' onClick={() => setTruncate(false)}>USE ALL DATA</button> : <button className='btn' onClick={() => setTruncate(true)}>TRUNCATE</button>}
      </div>
    </>
  );

}

export default Spider;