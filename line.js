const LineChart = async () => {

    // 1. Pristupanje podacima
    const dataset = await d3.json("nobel-prize.json");
    
    const yearCounts = {};
    dataset.forEach(d => {
        const year = d.year;
        if (!yearCounts[year]) {
            yearCounts[year] = 0;
        }
        yearCounts[year]++;
    });

    const data = Object.entries(yearCounts).map(([year, count]) => ({
        year: +year,
        count
    }));

    // 2. Dimenzije grafa
    const dimenzije = {
        width: 700, 
        height: 500,
        margin: {
            top: 15,
            right: 15,
            bottom: 40,
            left: 60
        },
    };
    dimenzije.boundsWidth = dimenzije.width - dimenzije.margin.left - dimenzije.margin.right;
    dimenzije.boundsHeight = dimenzije.height - dimenzije.margin.top - dimenzije.margin.bottom;

    // 3. Crtanje grafa
    const okvir = d3
        .select("#line-chart")
            .append("svg")
                .attr("width", dimenzije.width)
                .attr("height", dimenzije.height);

    const granice = okvir.append("g")
        .style("transform", `translate(${dimenzije.margin.left}px,${dimenzije.margin.top}px)`);
    
    //4. Definiranje razmjera

    // Definiranje mjerila za x i y osi
    const xMjerilo = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, dimenzije.boundsWidth]);
    
    const yMjerilo = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([dimenzije.boundsHeight, 0]);

    // 5. Iscrtavanje podataka
    
    // Kreiranje linije
    const generatorLinije = d3.line()
        .x(d => xMjerilo(d.year))
        .y(d => yMjerilo(d.count));
        
    // Dodavanje y osi
    granice.append("g")
        .call(d3.axisLeft(yMjerilo));

    // Dodavanje x osi
    granice.append("g")
        .attr("transform", `translate(0,${dimenzije.boundsHeight})`)
        .call(d3.axisBottom(xMjerilo).tickFormat(d3.format("d")));
    
    // Dodavanje oznake za x osu
    granice.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", dimenzije.boundsWidth / 2)
        .attr("y", dimenzije.boundsHeight + dimenzije.margin.bottom)
        .text("Godina");

    // Dodavanje oznake za y osu
    granice.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${-dimenzije.margin.left + 30},${dimenzije.boundsHeight / 2}) rotate(-90)`)
        .text("Broj dodjeljenih nagrada");

    // Dodavanje linije na graf
    granice.append("path")
        .datum(data)
        .attr("d", generatorLinije)
        .attr("fill", "none")
        .attr("stroke", "#0D3B66") 
        .attr("stroke-width", 2)
        .on("mouseenter", onMouseEnter)
        .on("mouseleave", onMouseLeave)

    // Dodavanje tooltipa i dinamičke točke
    const tooltip = d3.select("#line-chart").append("div")
        .attr("class", "tooltip")
        .style("display", "none");

    const dynamicPoint = granice.append("circle")
        .attr("class", "dynamic-point")
        .attr("r", 5)
        .style("display", "none");

    function onMouseEnter(event) {
        const [mouseX, mouseY] = d3.pointer(event);
        const x0 = xMjerilo.invert(mouseX);
        const i = d3.bisector(d => d.year).left(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const d = x0 - d0.year > d1.year - x0 ? d1 : d0;
        
        const dx = xMjerilo(d.year);
        const dy = yMjerilo(d.count);

        if (Math.abs(mouseX - dx) < 5 && Math.abs(mouseY - dy) < 5) {
            dynamicPoint
                .attr("cx", xMjerilo(d.year))
                .attr("cy", yMjerilo(d.count))
                .style("display", "block");

            tooltip
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 20}px`)
                .style("display", "block")
                .html(`Godina: ${d.year}<br>Dodjeljeno nagrada: ${d.count}`);
        } else {
            dynamicPoint.style("display", "none");
            tooltip.style("display", "none");
        }
    }
    // Funkcija za uklanjanje tooltipa i dinamičke točke
    function onMouseLeave() {
        dynamicPoint.style("display", "none");
        tooltip.style("display", "none");
    }
}
LineChart();