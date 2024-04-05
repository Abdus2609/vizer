import React, {useEffect} from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

function MapClusteredPoints({ data, labelField }) {

    useEffect(() => {
        
        var root = am5.Root.new('map-points');

        root.setThemes([
            am5themes_Animated.new(root)
        ]);

        var chart = root.container.children.push(am5map.MapChart.new(root, {
            panX: "rotateX",
            panY: "translateY",
            projection: am5map.geoMercator()
        }));

        chart.set("zoomControl", am5map.ZoomControl.new(root, {}));

        var polygonSeries = chart.series.push(
            am5map.MapPolygonSeries.new(root, {
                geoJSON: am5geodata_worldLow,
                exclude: ["AQ"]
            })
        );

        polygonSeries.mapPolygons.template.setAll({
          fill: am5.color(0xdadada),
        });

        var pointSeries = chart.series.push(am5map.ClusteredPointSeries.new(root, {}));
        
        pointSeries.set("clusteredBullet", function(root) {
            let container = am5.Container.new(root, {
              cursorOverStyle:"pointer"
            });
          
            let circle1 = container.children.push(am5.Circle.new(root, {
              radius: 8,
              tooltipY: 0,
              fill: am5.color(0xff8c00)
            }));
          
            let circle2 = container.children.push(am5.Circle.new(root, {
              radius: 12,
              fillOpacity: 0.3,
              tooltipY: 0,
              fill: am5.color(0xff8c00)
            }));
          
            let circle3 = container.children.push(am5.Circle.new(root, {
              radius: 16,
              fillOpacity: 0.3,
              tooltipY: 0,
              fill: am5.color(0xff8c00)
            }));
          
            let label = container.children.push(am5.Label.new(root, {
              centerX: am5.p50,
              centerY: am5.p50,
              fill: am5.color(0xffffff),
              populateText: true,
              fontSize: "8",
              text: "{value}"
            }));
          
            container.events.on("click", function(e) {
              pointSeries.zoomToCluster(e.target.dataItem);
            });
          
            return am5.Bullet.new(root, {
              sprite: container
            });
        });

        pointSeries.bullets.push(function() {
            let circle = am5.Circle.new(root, {
              radius: 6,
              tooltipY: 0,
              fill: am5.color(0xff8c00),
              tooltipText: "{title}"
            });
          
            return am5.Bullet.new(root, {
              sprite: circle
            });
        });

        for (var i = 0; i < data.length; i++) {
          let point = data[i]
          addPoint(point.longitude, point.latitude, point[labelField]);
        }

        function addPoint(longitude, latitude, title) {
            pointSeries.data.push({
              geometry: { type: "Point", coordinates: [longitude, latitude] },
              title: title
            });
        }

        chart.appear(1000, 100);

        return () => {
            chart.dispose();
            root.dispose();
        };
    
    }, []);

    return (
        <div id="map-points" style={{ width: "100%", height: "500px" }}></div>
    );
}

export default MapClusteredPoints;