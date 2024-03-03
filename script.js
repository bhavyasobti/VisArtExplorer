document.addEventListener('DOMContentLoaded', function(){

    const width = document.querySelector('#graph').clientWidth;
    const height = document.querySelector('#graph').clientHeight;
    const svg = d3.select('#graph').append('svg')
                  .attr('width', width)
                  .attr('height', height);

    // Define the dataset (this will usually be loaded externally)
    const artistsData = {
        nodes: [
            // Sample nodes: { id: "Artist Name", group: 1 }
        ],
        links: [
            // Sample links: { source: "Artist Name", target: "Artwork Name" }
        ]
    };

    // Create the network graph using D3.js here

    // Function to draw the network graph
    function drawGraph(data) {
        // Your D3.js code to draw the graph goes here
    }

    drawGraph(artistsData);
});