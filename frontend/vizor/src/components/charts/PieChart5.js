import React, { useEffect } from "react";
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

function PieChart5({ data, categoryField, valueField }) {

    useEffect(() => {
    
        var root = am5.Root.new('pie-chart');

        root.setThemes([
            am5themes_Animated.new(root)
        ])

        var chart = root.container.children.push(
            am5percent.PieChart.new(root, {
                endAngle: 270
            })
        );

        var series = chart.series.push(
            am5percent.PieSeries.new(root, {
                categoryField: categoryField,
                valueField: valueField,
                endAngle: 270,
            })
        );

        series.states.create("hidden", {
            endAngle: -90
        });

        series.data.setAll(data);

        series.appear(1000, 100);

        return () => {
            chart.dispose();
            root.dispose();
        };
    
    }, []);

    return (
        <div id="pie-chart" style={{ width: "100%", height: "500px" }}></div>
    );
}

export default PieChart5;