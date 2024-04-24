import React, { useEffect } from "react";
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

function Chord({ data, categoryFields, valueField }) {

    useEffect(() => {

        var chart = am4core.create("chord", am4charts.ChordDiagram);
        chart.hiddenState.properties.opacity = 0;

        chart.data = data.filter((_item, index) => index < 50);

        chart.dataFields.fromName = categoryFields[0];
        chart.dataFields.toName = categoryFields[1];
        chart.dataFields.value = valueField;
    
        let link = chart.links.template;
        link.fillOpacity = 0.8;

        chart.logo.disabled = true;

        return () => {
            chart.dispose();
        }

    }, [data, categoryFields, valueField]);

    return (
        <div id="chord" style={{ width: "100%", height: "700px" }}></div>
    );

}

export default Chord;