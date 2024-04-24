import React, { useEffect } from "react";
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

function Sankey({ data, categoryFields, valueField }) {

    useEffect(() => {
        
        var chart = am4core.create("sankey", am4charts.SankeyDiagram);
        chart.hiddenState.properties.opacity = 0;

        chart.data = data.filter((_item, index) => index < 50);

        chart.dataFields.fromName = categoryFields[0];
        chart.dataFields.toName = categoryFields[1];
        chart.dataFields.value = valueField;

        chart.nodePadding = 1;

        var hoverState = chart.links.template.states.create("hover");
        hoverState.properties.fillOpacity = 0.6;

        chart.logo.disabled = true;

        return () => {
            chart.dispose();
        }

    }, [data, categoryFields, valueField]);


    return (
        <div id="sankey" style={{ width: "100%", height: "700px" }}></div>
    );
}

export default Sankey;