document.addEventListener('DOMContentLoaded', function(){
    
    const width = 1000;
    const height = 700;
    const radius = Math.min(width, height) / 2;
    const artworkRadius = 30;
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
        const radiusIncrement = 30; 
        return yearOffset * radiusIncrement;  }
    

//FORCE SIMULATION
    const simulation = d3.forceSimulation(networkData.nodes)
    .force("link", d3.forceLink(networkData.links).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-60))
    .force("collide", d3.forceCollide(20))
    //.force("collide", d3.forceCollide().radius(d => d.radius + 2))
    .force("radial", d3.forceRadial(d => d.type === 'artwork' ? calculateRadius(d) : 0, 0, 0))
    .force("center", d3.forceCenter(0,0,0))
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
                    .call(drag(simulation));
                    
    
// IMAGES
    node.filter(d => d.type === 'artwork')
        .append("image")
        .attr("xlink:href", d => d.image)
        .attr("x", -artworkRadius)
        .attr("y", -artworkRadius)
        .attr("width", artworkRadius * 2)
        .attr("height", artworkRadius * 2)
        .on("mouseover", showImageTooltip)
        .on("mousemove", showImageTooltip)
        .on("mouseout", hideImageTooltip);
    
// ARTISTS
    node.filter(d => d.type === 'artist')
        .append("circle")
        .attr("r", artistRadius)
        .attr('class', 'artist')
        .style('outline', 'none');
        
// TITLE
 //   node.append("title")
 //       .text(d => d.id);     
    
//TICKS
    function ticked() {
        
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
    
        node.attr("transform", d => `translate(${d.x}, ${d.y})`);
    }
    
//HIGHLIGHT FUNCTIONALITY INDIVIDUAL
    node.on("click", (event, d) => {
        event.stopPropagation();
        resetHighlights();
              
              node.style("fill", nodeData => {
                return networkData.links.some(link => 
                    (link.source === d && link.target === nodeData) ||
                    (link.target === d && link.source === nodeData)
                ) ? "#ff908b" : "#808080"; }); 

                const authorElem = document.getElementById(`author-${d.id}`);
                if (authorElem) {
                authorElem.style.color = "#ff908b"; 
                authorElem.style.fontWeight = "bold";
                authorElem.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
                }

                node.selectAll('circle')
                .transition()
                .duration(200)
                .attr("r", (nodeData => {
                    if(nodeData === d){return 10;}
                    else{
                    return networkData.links.some(link => (link.source === d && link.target === nodeData) ||(link.target === d && link.source === nodeData)) 
                        ?10:5;
                        }
        }));
            
            node.style("opacity", nodeData => {
                return networkData.links.some(link => 
                    (link.source === d && link.target === nodeData) ||
                    (link.target === d && link.source === nodeData)
                ) ? 1 : 0.5;});


        link.style("stroke-opacity", 0.1)
        .style("stroke-width", "2px");

        d3.select(event.currentTarget)
        .style("fill", "#ff908b")
        .style("opacity", 1);

        link.filter(l => l.source.id === d.id || l.target.id === d.id)
            .style("stroke-opacity", 1)
            .style("stroke-width", "3px")
            .style("stroke", function(d){ return "#ff908b"});

        if (d.type === 'artwork') {
            window.showStoryCard(d.details);
        }

    });

    svg.on("click", () => {
        resetHighlights();
    });

//RESET HIGHLIGHTS 
    function resetHighlights() {
      node.style("fill", "#000");
      node.style("opacity", "1");
      node.selectAll('circle').attr('r', artistRadius);
      link.attr("display","block");
      link.style("stroke-opacity", 0.6) 
          .style("stroke-width", "2px")
          .style("stroke", function(d){ return "#000"});

      authorList.forEach(author => {
            const authorElem = document.getElementById(`author-${author.name}`);
            if (authorElem) {
                authorElem.style.color = ""; 
                authorElem.style.fontWeight = ""; 
            }
        });
    }
    
//BARCHART
    const margin = { top: 10, right: 50, bottom: 200, left: 50 };
    const chartWidth = 400 - margin.left - margin.right;
    const chartHeight = 700 - margin.top - margin.bottom;
        
    const svgBarChart = d3.select("#barChart").append("svg")
                        .attr("width", '100%')
                        .attr("height", '100%')
                        .attr("viewBox", `0 0 ${chartWidth + margin.left + margin.right} ${chartHeight + margin.top + margin.bottom}`)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const y = d3.scaleBand()
            .range([0, chartHeight])
            .domain(barChartData.map(d => d.year))
            .padding(0.1);

    svgBarChart.append("g")
        .call(d3.axisLeft(y));

    const x = d3.scaleLinear()
        .domain([0, d3.max(barChartData, d => d3.max(d.types, type => type.count))])
        .range([0, chartWidth]);

    svgBarChart.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(x));

    const gap=2;
    const color = d3.scaleOrdinal(['#ff908b', '#ff9c75', '#ffc78b', '#ffdd47']);

    barChartData.forEach(yearData => {
        let cumulativeWidth = 0;  
        
        svgBarChart.selectAll(`.sub-bar-${yearData.year}`)
            .data(yearData.types.map(typeData => ({...typeData, year: yearData.year})))
            .enter().append("rect")
            .attr("class", `sub-bar-${yearData.year}`)
            .attr("y", d => y(yearData.year))
            .attr("height", y.bandwidth())
            .attr("x", d => {
                let currentX = cumulativeWidth;
                cumulativeWidth += x(d.count) + gap;
                return currentX;
            })
            .attr("width", d => x(d.count))
            .attr("fill", d => color(d.type))
            .on("mouseover", showBarTooltip)
            .on("mousemove", showBarTooltip)
            .on("mouseout", hideBarTooltip) 
            .on("click", function(event, d) {
            highlightYear(d.year);
            });
        });


//LEGEND

    const artworkTypes = new Set(all_artworks.map(d => d.type));

    const legendDiv = d3.select("#legend");

    artworkTypes.forEach(type => {
        let legendItem = legendDiv.append("div").style("display", "flex").style("align-items", "center");

        legendItem.append("div")
            .style("width", "20px")
            .style("height", "20px")
            .style("background-color", color(type))
            .style("margin-right", "5px");

        legendItem.append("text").text(type);
    }); 
            
//HIGHLIGHT FUNCTIONALITY YEAR

    function highlightYear(selectedYear) {
        event.stopPropagation();
        resetHighlights();

        let currentArtworks = new Set();
        networkData.nodes.forEach(node => {
            if (node.type === 'artwork' && node.year === selectedYear) {
                currentArtworks.add(node);
            }
        });

        node.style("opacity", d => {
            if (d.type === 'artwork' && d.year === selectedYear) {
                return 1; 
            } 
            
            else if (d.type === 'artist'){
            const isConnectedToHighlightedArtwork = networkData.links.some(link => 
            (currentArtworks.has(link.source) && link.target === d) ||
            (currentArtworks.has(link.target) && link.source === d));
            return isConnectedToHighlightedArtwork ? 1 : 0.5; }

            else { return 0.2;}
        
    });

    node.selectAll('circle')
                .transition()
                .duration(200)
                .attr("r", (d => {
                    const isConnectedToHighlightedArtwork = networkData.links.some(link => 
                        (currentArtworks.has(link.source) && link.target === d) ||
                        (currentArtworks.has(link.target) && link.source === d));
                        return isConnectedToHighlightedArtwork ? 10 : 5;
                        
        }));


    node.style("fill", d=>{
        const isConnectedToHighlightedArtwork = networkData.links.some(link => 
        (currentArtworks.has(link.source) && link.target === d) ||
        (currentArtworks.has(link.target) && link.source === d));
        return isConnectedToHighlightedArtwork ? "#ff908b" : "#808080"; });

        link.style("stroke-opacity", l => currentArtworks.has(l.source) || currentArtworks.has(l.target) ? 1 : 0.1)
            .style("stroke-width", l => currentArtworks.has(l.source) || currentArtworks.has(l.target) ? "3px" : "2px")
            .style("stroke",   l => currentArtworks.has(l.source) || currentArtworks.has(l.target) ?"#ff908b" : "#808080");
    }

//AUTHOR LIST

let authorCount = {}

networkData.links.forEach(link => {
    if(link.target.type==='artist'){
        const authorId = link.target.id;
        if(authorId in authorCount){authorCount[authorId] += 1;}
        else{ authorCount[authorId] = 1;}
        }
})

let authorList = Object.keys(authorCount).sort().map(author => {
    return { name: author, count: authorCount[author] };
});

//console.log(authorList);

const maxFontSize = 24; 
const minFontSize = 12; 
const maxContributions = Math.max(...authorList.map(a => a.count));

//console.log("Max contributions:", maxContributions);

authorList.forEach(author => {
    const fontSize = minFontSize + (author.count * 2);
    const authorElem = document.createElement("p");
    authorElem.id = `author-${author.name}`;
    authorElem.textContent = author.name;
    authorElem.style.fontSize = `${fontSize}px`;
    authorElem.style.cursor = 'pointer';
    authorElem.onclick = () => highlightAuthor(author.name);
    document.getElementById("author-list").appendChild(authorElem);
});

function highlightAuthor(selectedAuthor){
    event.stopPropagation();
    resetHighlights();

    const authorElem = document.getElementById(`author-${selectedAuthor}`);
    if (authorElem) {
        authorElem.style.color = "#ff908b"; 
        authorElem.style.fontWeight = "bold"; 
    }
              
    node.style("fill", d => {
            return (d.type==='artist' && d.id === selectedAuthor) ? "#ff908b" : "#808080"; });
            
            
    node.style("opacity", d => {
        if (d.type === 'artist' && d.id === selectedAuthor) {
            return 1; 
        } else if (d.type === 'artwork') {
            return isConnectedtoAuthor(d, selectedAuthor) ? 1 : 0.5; 
        } else {
            return 0.5;
        }
    });

    link.style("stroke-opacity", 0.1)
        .style("stroke-width", "2px");

    link.filter(l => l.source.id === selectedAuthor || l.target.id === selectedAuthor)
        .style("stroke-opacity", 1)
        .style("stroke-width", "3px")
        .style("stroke", function(d){ return "#ff908b"});

        node.selectAll('circle').each(function(d) {
            if (d.type === 'artist') {
                if (d.id === selectedAuthor) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('r', 10); 
                } else {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('r', 5); 
                }
            }
        });
}

function isConnectedtoAuthor(d, selectedAuthor){
    const isConnected= networkData.links.some(link => 
        (link.source.id === selectedAuthor && link.target.id === d.id) ||
        (link.target.id === selectedAuthor && link.source.id === d.id));
        return isConnected;
}

//TOOLTIPS

//tooltips for authors
var tooltip = d3.select("#authortooltip");
function showTooltip(event, d) {
    tooltip.style("opacity", 1)
           .html("Name: " + d.id + "<br>Contributions: " + (authorCount[d.id] || 0))
           .style("left", (event.pageX + 10) + "px")
           .style("top", (event.pageY + 10) + "px");
}

function hideTooltip() {
    tooltip.style("opacity", 0);
}

node.filter(d => d.type === 'artist')
    .on("mouseover", showTooltip)
    .on("mousemove", showTooltip)
    .on("mouseout", hideTooltip);


//tooltips for images
var imageTooltip = d3.select("#imagetooltip");
function showImageTooltip(event, d) {
    imageTooltip.html(d.id) 
        .style("opacity", 1)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px");
}

function hideImageTooltip() {
    imageTooltip.style("opacity", 0);
}


//tooltips for barchart
var barTooltip = d3.select("#bartooltip");
function showBarTooltip(event, d) {
    barTooltip.style("opacity", 1)
              .html(`Year: ${d.year}<br>Type: ${d.type}<br>Count: ${d.count}`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY + 10) + "px");
}

function hideBarTooltip() {
    barTooltip.style("opacity", 0);
}



});
