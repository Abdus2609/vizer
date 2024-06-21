import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

function HierarchyTree5({ data, categoryFields }) {

    useEffect(() => {

        var root = am5.Root.new("hierarchy-tree");

        root.setThemes([am5themes_Animated.new(root)]);

        var chart = root.container.children.push(am5hierarchy.Tree.new(root, {
            singleBranchOnly: false,
            downDepth: 1,
            initialDepth: 2,
            topDepth: 0,
            valueField: "value",
            categoryField: "name",
            childDataField: "children",
            idField: "name",
            parentIdField: "parent",
        }));

        var transformedData = [];

        var pks = [];

        data.forEach(item => {
			if (!pks.includes(item[categoryFields[0]])) {
				pks.push(item[categoryFields[0]]);
			}
		});

		pks.forEach(key1 => {
			transformedData.push({
				name: key1,
				children: []
			})
		});

		data.forEach(item => {
			transformedData.forEach(group => {
				if (group.name === item[categoryFields[0]]) {
					if (group.children.length < 10)
						group.children.push({
							name: item[categoryFields[1]],
							value: 0
						});
				}
			});
		});

        transformedData.sort((a, b) => b.children.length - a.children.length);
        transformedData = transformedData.filter((item, index) => index < 10);

        var treeData = {
            name: "Root",
            children: transformedData
        };

		chart.data.setAll([treeData]);
        chart.appear(1000, 100);

		return () => {
            root.dispose();
		}

    }, [data, categoryFields]);

    return <div id="hierarchy-tree" style={{ width: "100%", height: "600px" }}></div>;
}

export default HierarchyTree5;