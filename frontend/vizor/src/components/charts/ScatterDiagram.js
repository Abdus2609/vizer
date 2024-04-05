import React, {useEffect} from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

function ScatterChart({ data, valueXField, valueYField }) {

    
    useEffect(() => {
        
        console.log(data);
        console.log(valueXField);
        console.log(valueYField);
        
        var root = am5.Root.new('scatter-chart');
    
        root.setThemes([
            am5themes_Animated.new(root)
        ]);

        var chart = root.container.children.push(am5xy.XYChart.new(root, {
            panX: true,
            panY: true,
            wheelY: "zoomX",
            pinchZoomX: true,
            pinchZoomY: true
        }));

        var xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
            renderer: am5xy.AxisRendererX.new(root, {
                minGridDistance: 50
            }),
            tooltip: am5.Tooltip.new(root, {})
        }));

        xAxis.ghostLabel.set("forceHidden", true);

        var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
            renderer: am5xy.AxisRendererY.new(root, {}),
            tooltip: am5.Tooltip.new(root, {})
        }));

        var series = chart.series.push(am5xy.LineSeries.new(root, {
            name: "Series 1",
            calculateAggregates: true,
            valueXField: valueXField,
            valueYField: valueYField,
            xAxis: xAxis,
            yAxis: yAxis,
            tooltip: am5.Tooltip.new(root, {
                labelText: "x: {valueX} y: {valueY}"
            })
        }));

        series.bullets.push(function() {
            var graphics = am5.Triangle.new(root, {
                fill: series.get("fill"),
                width: 10,
                height: 10
            });

            return am5.Bullet.new(root, {
                sprite: graphics
            });
        });

        series.strokes.template.setAll("strokeOpacity", 0);
        xAxis.data.setAll(data);
        series.data.setAll(data);

        chart.set("scrollbarX", am5.Scrollbar.new(root, {
            orientation: "horizontal"
        }));
          
        chart.set("scrollbarY", am5.Scrollbar.new(root, {
            orientation: "vertical"
        }));
        
        series.appear(1000);
        chart.appear(1000, 100);

        return () => {

            chart.dispose();
            root.dispose();
        };
    }, []);

    return (
        <div id="scatter-chart" style={{ width: "100%", height: "500px" }}></div>
    );
}

export default ScatterChart;