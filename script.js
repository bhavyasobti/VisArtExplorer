document.addEventListener('DOMContentLoaded', function(){

    const width = document.querySelector('#graph').clientWidth;
    const height = document.querySelector('#graph').clientHeight;
    const svg = d3.select('#graph').append('svg')
                  .attr('width', width)
                  .attr('height', height);

    
    

    // Function to draw the network graph
    function drawGraph(data) {
        // Your D3.js code to draw the graph goes here
    }

    drawGraph(artistsData);
});