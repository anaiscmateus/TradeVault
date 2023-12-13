// CHART OPTIONS
var options = {
  series: [{
  name: 'pnl',
  data: [
  ]
}],
  chart: {
  type: 'area',
  height: 250,
  width: '100%',
  toolbar: {
    show: false,
  }, 
},
dataLabels: {
  enabled: false
},
stroke: {
  curve: 'straight'
},
xaxis: {
  type: 'datetime',
  labels: {
    style: {
      colors: '#fff'
    }
  },
  axisBorder: {
    show: false
  },
  axisTicks: {
    show: false
  }
},
yaxis: {
  tickAmount: 4,
  floating: false,

  labels: {
    style: {
      colors: '#fff',
    },
    offsetY: -7,
    offsetX: 0,
  },
  axisBorder: {
    show: false,
  },
  axisTicks: {
    show: false
  }
},
fill: {
  opacity: 0.5
},
tooltip: {
  x: {
    format: "yyyy",
  },
  fixed: {
    enabled: false,
    position: 'topRight'
  }
},
grid: {
  yaxis: {
    lines: {
      offsetX: -30
    }
  },
  padding: {
    left: 20
  }
}
};

// grab the data via an api call
// format the data to send to the options
// Function to make API call and render chart
async function fetchDataAndRenderChart() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();

    // Create an array to store the series data
    const seriesData = [];

    // Build the series data array based on the API response
    data.forEach(trade => {
      if(trade.finalPurchaseDate && trade.returnAmount)
      seriesData.push({
        x: new Date(trade.finalPurchaseDate),
        y: trade.returnAmount
      });
    });

    // Update the options.series[0].data array
    options.series[0].data = seriesData;
    
    // create and render
    var chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();

  } catch (error) {
    console.error(error);
  }
}

// Fetch data and render chart on page load
fetchDataAndRenderChart();
