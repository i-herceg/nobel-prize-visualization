async function drawScatterPlot() {

    // 1. Pristupanje podacima
    const dataset = await d3.json("nobel-prize.json");

    const filteredDataset = dataset.filter(d => d.gender === "male" || d.gender === "female");

    // 2. Dimenzije grafa
    const dimenzije = {
        sirina: 700,
        visina: 500,
        margine: {
            top: 30,
            right: 30,
            bottom: 50,
            left: 50,
        },
    };
    dimenzije.grSirina = dimenzije.sirina - dimenzije.margine.left - dimenzije.margine.right;
    dimenzije.grVisina = dimenzije.visina - dimenzije.margine.top - dimenzije.margine.bottom;

    // 3. Crtanje grafa
    const okvir = d3.select("#scatter")
        .append("svg")
        .attr("width", dimenzije.sirina)
        .attr("height", dimenzije.visina)
        .append("g")
        .attr("transform", `translate(${dimenzije.margine.left},${dimenzije.margine.top})`);

    // 4. Definiranje razmjera
    const xScale = d3.scaleLinear()
        .domain(d3.extent(filteredDataset, d => d.year))
        .range([0, dimenzije.grSirina])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([d3.min(filteredDataset, d => d.year - parseInt(d.born)), d3.max(filteredDataset, d => d.year - parseInt(d.born))])
        .range([dimenzije.grVisina, 0])
        .nice();

    okvir.append("g")
        .attr("transform", `translate(0,${dimenzije.grVisina})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    okvir.append("g")
        .call(d3.axisLeft(yScale));

    okvir.append("text")
        .attr("x", dimenzije.grSirina / 2)
        .attr("y", dimenzije.grVisina + dimenzije.margine.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Godina dodjele nagrade");

    okvir.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -dimenzije.grVisina / 2)
        .attr("y", -dimenzije.margine.left + 15)
        .attr("text-anchor", "middle")
        .text("Dob laureanta");

    const color = d3.scaleOrdinal()
        .domain(["male", "female"])
        .range(["#385f83", "#f95738"]);
    
    // 5. Iscrtavanje podataka
    okvir.selectAll("circle")
            .data(filteredDataset)
        .enter().append("circle")
            .attr("cx", d => xScale(d.year))
            .attr("cy", d => yScale(d.year - parseInt(d.born)))
            .attr("r", 5)
            .attr("class", "tocke")
            .attr("fill", d => color(d.gender))
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .style("opacity", 0.7);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    okvir.selectAll("circle")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Ime: ${d.fullName}<br>Godina: ${d.year}<br>Godine: ${d.year - parseInt(d.born)}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
}

drawScatterPlot();
