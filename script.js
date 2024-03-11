document.addEventListener('DOMContentLoaded', function(){
    
    const width = 1000;
    const height = 700;
    const radius = Math.min(width, height) / 2;
    const artworkRadius = 25;
    const artistRadius = 5;
    
    // Initialize SVG
    const svg = d3.select("#networkGraph")
                  .attr("viewBox", [-width , -height , width*2, height*2]);


    // Drag 
    const drag = simulation => {
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
    }


    function calculateRadius(d) {
        const yearOffset = d.year - 2013;
        const radiusIncrement = 36; 
        return yearOffset * radiusIncrement;
    }
    

//FORCE SIMULATION
    const simulation = d3.forceSimulation(networkData.nodes)
    .force("link", d3.forceLink(networkData.links).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-50))
    .force("collide", d3.forceCollide(10))
    .force("radial", d3.forceRadial(d => d.type === 'artwork' ? calculateRadius(d) : 0, 0, 0 ))
    .on("tick", ticked);
    
    //LINKS
    const link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(networkData.links)
    .join("line")
    .attr("stroke", "#000") 
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", 2); 
    
    // NODES
    const node = svg.append("g")
                    .attr("class", "nodes")
                    .selectAll("g")
                    .data(networkData.nodes)
                    .join("g")
                    .call(drag(simulation))

                    
    
    // IMAGES
    node.filter(d => d.type === 'artwork')
        .append("image")
        .attr("xlink:href", d => d.image)
        .attr("x", -artworkRadius)
        .attr("y", -artworkRadius)
        .attr("width", artworkRadius * 2)
        .attr("height", artworkRadius * 2);
    
    // ARTISTS
    node.filter(d => d.type === 'artist')
        .append("circle")
        .attr("r", artistRadius);
    
    // TITLE
    node.append("title")
        .text(d => d.id);
    
    
    function ticked() {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
    
        node.attr("transform", d => `translate(${d.x}, ${d.y})`);
    }
    
    //HILIGHT FUNCTIONALITY
    node.on("click", (event, d) => {
        event.stopPropagation();

            link
              .attr("display", "none")
              .filter(l => l.source.id === d.id || l.target.id === d.id)
              .attr("display", "block");

        if (d.type === 'artwork') {
            window.showStoryCard(d.details);
        }
    });

    svg.on("click", () => {
        resetHighlights();
    });

    
    function resetHighlights() {
      link.attr("display","block");
    }
    
});




