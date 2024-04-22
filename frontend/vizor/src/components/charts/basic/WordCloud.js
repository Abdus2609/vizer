import React, { useEffect } from "react";
import * as am4core from '@amcharts/amcharts4/core';
import * as am4plugins_wordCloud from '@amcharts/amcharts4/plugins/wordCloud';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

function WordCloud({ data, categoryField, valueField }) {

    useEffect(() => {

        var chart = am4core.create("word-cloud", am4plugins_wordCloud.WordCloud);
        var series = chart.series.push(new am4plugins_wordCloud.WordCloudSeries());

        series.data = data;

        series.dataFields.word = categoryField;
        series.dataFields.value = valueField;

        chart.logo.disabled = true;
        series.labels.template.tooltipText = categoryField + ": [bold]{word}[/]\n" + valueField + ": [bold]{value}[/]";;

        return () => {
            chart.dispose();
        };
    }, [data, categoryField, valueField]);

    return (
        <div id="word-cloud" style={{ width: "100%", height: "700px" }}></div>
    );
}

export default WordCloud;