function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}
init();


function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    var PANEL = d3.select("#sample-metadata");
    PANEL.html("");

    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

function buildCharts(sample) {
  d3.json("samples.json").then((data) => {
    var samples = data.samples;
    var sampleNum = samples.filter(sampleObj => sampleObj.id == sample);
    var result = sampleNum[0];
    
    const otuData = result.otu_ids.map((otuId, idx) => {
      return {
        otuId: otuId,
        axisLabel: 'OTU ' + otuId,
        otuLabel: result.otu_labels[idx],
        value: result.sample_values[idx]
      }
    });

    const top10Data = otuData.sort((a,b) => b.value - a.value).slice(0,10).reverse();
   
    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order so the otu_ids with the most bacteria are last. 
    var top10axisLabels = top10Data.map(el => el.axisLabel);
    var top10values = top10Data.map(el => el.value);
    var top10otuLabels = top10Data.map(el => el.otuLabel);
   
    var barData = {
      x: top10values,
      y: top10axisLabels,
      type: "bar",
      orientation: 'h',
      text: top10otuLabels,
      marker: {
        color: 'burlywood',
        opacity: 0.8,
        line: {
          color: 'teal',
          width: 1.5
        }
      }
    };
    
    var barLayout = {
      title: "<b>Top 10 Bacteria Cultures Found</b>",
  };
  
  Plotly.newPlot("bar", [barData], barLayout);
  
  var otuIds = otuData.map(el => el.otuId);
  var values = otuData.map(el => el.value);
  var otuLabels = otuData.map(el => el.otuLabel);

  var bubbleData = {
    x: otuIds,
    y: values,
    mode: 'markers',
    text: otuLabels,
    marker: {
      color: otuIds,
      size: values,
      colorscale: 'Earth'
    }
    
  };

  var bubbleLayout = {
    title: "<b>Bacteria Cultures Per Sample</b>",
    xaxis: {
      title: {
        text: "OTU IDs"}}
  };

  Plotly.newPlot("bubble", [bubbleData], bubbleLayout);

  var metadata = data.metadata;
  var thing = metadata.filter(sampleObj => sampleObj.id == sample);
  var result = thing[0];
  var wfreq = result.wfreq;
  console.log(wfreq);

  var gaugeData = [
    {
      domain: { x: [0, 1], y: [0, 1] },
      value: wfreq,
      title: { text: "<b>Belly Button Washing Frequency</b><br><span>Scrubs per Week</span>" },
      type: "indicator",
      mode: "gauge+number",
      gauge: {
        axis: { range: [null, 10]},
        bar: { color: "maroon" },
        steps: [
          { range: [0, 2], color: "crimson" },
          { range: [2, 4], color: "orangered" },
          { range: [4, 6], color: "yellow" },
          { range: [6, 8], color: "yellowgreen" },
          { range: [8, 10], color: "forestgreen" }
        ],
      }
    }
  ];
  
  var gaugeLayout = {width: 500, height: 400, margin: { t: 0, b: 0 } };

  Plotly.newPlot("gauge", gaugeData, gaugeLayout);

});
}

