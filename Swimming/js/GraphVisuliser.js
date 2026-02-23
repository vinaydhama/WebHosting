        function parseTimeToSeconds(timeStr) {
            const [minSec, millis] = timeStr.split('.');
            const [min, sec] = minSec.split(':');
            return parseInt(min) * 60 + parseInt(sec) + parseFloat('0.' + millis);
        }

        
        function createPlot(title, dataObj) {
            let chartsDiv = document.getElementById('chartVis');
            const div1 = document.createElement('div');
            div1.className='page-break-before'
            const div = document.createElement('div');
                div.className = 'plot';
                div1.appendChild(div);                
                chartsDiv.appendChild(div1);
                Plotly.newPlot(div, dataObj.data, dataObj.layout);
            }


function plotVisualiser()
{   
    
    const table = document.getElementById('performanceTable');
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const data = rows.map(row => {
        const cells = row.querySelectorAll('td');
        return {
            slno: parseInt(cells[0].textContent),
            rank: parseInt(cells[1].textContent),
            eventId: cells[2].textContent,
            heatDateTime: new Date(cells[3].textContent),
            stroke: cells[4].textContent,
            distance: parseInt(cells[5].textContent),
            timeStr: cells[6].textContent,
            time: parseTimeToSeconds(cells[6].textContent)
        };
    });


       // 1. Average Time per Stroke
       const strokes = [...new Set(data.map(d => d.stroke))];
       const avgTimePerStroke = strokes.map(stroke => {
           const times = data.filter(d => d.stroke === stroke).map(d => d.time);
           return times.reduce((a, b) => a + b, 0) / times.length;
       });
       createPlot("Average Time per Stroke", {
           data: [{ x: strokes, y: avgTimePerStroke, type: 'bar' }],
           layout: { title: "Average Time per Stroke" }
       });

       // 2. Average Time per Distance
       const distances = [...new Set(data.map(d => d.distance))];
       const avgTimePerDistance = distances.map(dist => {
           const times = data.filter(d => d.distance === dist).map(d => d.time);
           return times.reduce((a, b) => a + b, 0) / times.length;
       });
       createPlot("Average Time per Distance", {
           data: [{ x: distances.map(String), y: avgTimePerDistance, type: 'bar' }],
           layout: { title: "Average Time per Distance" }
       });

       // 3. Time progression over Heat DateTime for each Event ID
       const eventIds = [...new Set(data.map(d => d.eventId))];
       const timeProgression = eventIds.map(eventId => {
           const filtered = data.filter(d => d.eventId === eventId).sort((a, b) => a.heatDateTime - b.heatDateTime);
           return {
               x: filtered.map(d => d.heatDateTime),
               y: filtered.map(d => d.time),
               mode: 'lines+markers',
               name: eventId
           };
       });
       createPlot("Time Progression over Heat DateTime", {
           data: timeProgression,
           layout: { title: "Time Progression over Heat DateTime" }
       });

       // 4. Rank progression over Heat DateTime
       const rankProgression = {
           x: data.map(d => d.heatDateTime),
           y: data.map(d => d.rank),
           mode: 'lines+markers',
           type: 'scatter',
           name: 'Rank'
       };
       createPlot("Rank Progression over Heat DateTime", {
           data: [rankProgression],
           layout: { title: "Rank Progression over Heat DateTime" }
       });

       // 5. Time vs Distance
       createPlot("Time vs Distance", {
           data: [{
               x: data.map(d => d.distance),
               y: data.map(d => d.time),
               mode: 'markers',
               type: 'scatter'
           }],
           layout: { title: "Time vs Distance" }
       });

       // 6. Time vs Rank
       createPlot("Time vs Rank", {
           data: [{
               x: data.map(d => d.rank),
               y: data.map(d => d.time),
               mode: 'markers',
               type: 'scatter'
           }],
           layout: { title: "Time vs Rank" }
       });

       // 7. Box Plot: Time per Stroke
       const boxData = strokes.map(stroke => {
           return {
               y: data.filter(d => d.stroke === stroke).map(d => d.time),
               type: 'box',
               name: stroke
           };
       });
       createPlot("Box Plot: Time per Stroke", {
           data: boxData,
           layout: { title: "Box Plot: Time per Stroke" }
       });

       // 8. Box Plot: Time per Distance
       const boxDistData = distances.map(dist => {
           return {
               y: data.filter(d => d.distance === dist).map(d => d.time),
               type: 'box',
               name: dist.toString()
           };
       });
       createPlot("Box Plot: Time per Distance", {
           data: boxDistData,
           layout: { title: "Box Plot: Time per Distance" }
       });

       // 9. Heatmap: Rank vs Distance
       const heatmapData = [];
       for (let r of [...new Set(data.map(d => d.rank))]) {
           heatmapData.push(distances.map(dist => {
               return data.filter(d => d.rank === r && d.distance === dist).length;
           }));
       }
       createPlot("Heatmap: Rank vs Distance", {
           data: [{
               z: heatmapData,
               x: distances.map(String),
               y: [...new Set(data.map(d => d.rank))].map(String),
               type: 'heatmap'
           }],
           layout: { title: "Heatmap: Rank vs Distance" }
       });

       // 10. Histogram of Time
       createPlot("Histogram of Time", {
           data: [{
               x: data.map(d => d.time),
               type: 'histogram'
           }],
           layout: { title: "Histogram of Time" }
       });

       // 11. Pie Chart: Stroke Distribution
       const strokeCounts = strokes.map(stroke => data.filter(d => d.stroke === stroke).length);
       createPlot("Pie Chart: Stroke Distribution", {
           data: [{
               labels: strokes,
               values: strokeCounts,
               type: 'pie'
           }],
           layout: { title: "Pie Chart: Stroke Distribution" }
       });

       // 12. Pie Chart: Distance Distribution
       const distCounts = distances.map(dist => data.filter(d => d.distance === dist).length);
       createPlot("Pie Chart: Distance Distribution", {
           data: [{
               labels: distances.map(String),
               values: distCounts,
               type: 'pie'
           }],
           layout: { title: "Pie Chart: Distance Distribution" }
       });

       // 13. Violin Plot: Time per Stroke
       const violinData = strokes.map(stroke => {
           return {
               y: data.filter(d => d.stroke === stroke).map(d => d.time),
               type: 'violin',
               name: stroke,
               box: { visible: true },
               line: { color: 'blue' }
           };
       });
       createPlot("Violin Plot: Time per Stroke", {
           data: violinData,
           layout: { title: "Violin Plot: Time per Stroke" }
       });

       // 14. Facet Grid: Time vs Distance segmented by Stroke
       const facetData = strokes.map(stroke => {
           return {
               x: data.filter(d => d.stroke === stroke).map(d => d.distance),
               y: data.filter(d => d.stroke === stroke).map(d => d.time),
               mode: 'markers',
               type: 'scatter',
               name: stroke
           };
       });
       createPlot("Facet Grid: Time vs Distance by Stroke", {
           data: facetData,
           layout: { title: "Facet Grid: Time vs Distance by Stroke" }
       });

       // 15. Stacked Bar Chart: Count of Events per Stroke and Distance
       const stackedData = strokes.map(stroke => {
           return {
               x: distances.map(String),
               y: distances.map(dist => data.filter(d => d.stroke === stroke && d.distance === dist).length),
               name: stroke,
               type: 'bar'
           };
       });
       createPlot("Stacked Bar Chart: Events per Stroke and Distance", {
           data: stackedData,
           layout: { title: "Stacked Bar Chart: Events per Stroke and Distance", barmode: 'stack' }
       });   

}
     