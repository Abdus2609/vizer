import React, { useState, useEffect } from 'react';
import { Chart } from 'react-google-charts';

function Calendar({ data, categoryField, valueField }) {

	const [charts, setCharts] = useState([]);
	const options = {
		calendar: {
			cellSize: 15,
			cellColor: {
				stroke: '#76a7fa',
				strokeOpacity: 0.5,
			},
		},
	};

	useEffect(() => {

		const years = {};

		data.forEach((item, index) => {
			const date = new Date(item[valueField]);
			const year = date.getFullYear();

			if (!years[year]) {
				years[year] = [['Date', 'Value']];
			}

			years[year].push([date, index]);
		});

		setCharts(Object.entries(years));

	}, [data, categoryField, valueField]);

	return (
		<div id="calendar" style={{ width: "100%", height: "600px", overflowY: "auto", marginTop: "20px" }}>
			{charts.map(([year, chartData]) => (
				<div key={year} style={{ marginBottom: "20px" }}>
					<Chart
						chartType="Calendar"
						data={chartData}
						options={options}
						width="100%"
					/>
				</div>
			))}
		</div>
	);
}

export default Calendar;