document.addEventListener("DOMContentLoaded", function() {
    
    var map = L.map('map').setView([20, 0], 2); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

var contributionCounts = {};

all_artworks.forEach(artwork => {
    let year = artwork.year;
    if (contributionCounts[year]) {
        contributionCounts[year] += 1;
    } else {
        contributionCounts[year] = 1;
    }
});

theme_data.forEach(theme => {
    let coords = theme.coords;
    let year = theme.Year;
    let contributions = contributionCounts[year] || 0;
    let yearUrl = theme.Link;

    var circle = L.circleMarker(coords, {
        radius: contributions / 1.4 ,
        fillColor: "#ff908b",
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    });

    circle.bindTooltip(`Year: ${year}<br>Theme: ${theme.Theme}<br>Location: ${theme.Where}<br>Contributions: ${contributions}`);
    circle.on('click', function() {
        window.open (yearUrl, '_blank'); 
    });
    circle.addTo(map);
});
});