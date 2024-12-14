async function drawRadarChart() {

    // Ucitavanje skupa podataka
    const dataset = await d3.json("nobel-prize.json");

    const categories = ["physics", "chemistry", "medicine", "literature", "peace", "economics"];

    // Dohvaćanje određene godine
    const years = Array.from(new Set(dataset.map(d => d.year))).sort((a, b) => a - b);
    years.unshift("All");

    // Dimenzije grafa
    const dimenzije = {
        sirina: 600,
        visina: 500,
        margine: {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
        },
    };

    const radius = Math.min(dimenzije.sirina - dimenzije.margine.left - dimenzije.margine.right,
        dimenzije.visina - dimenzije.margine.top - dimenzije.margine.bottom) / 2;

    const svg = d3.select("#radar")
        .append("svg")
        .attr("width", dimenzije.sirina)
        .attr("height", dimenzije.visina)
        .append("g")
        .attr("transform", `translate(${dimenzije.sirina / 2},${dimenzije.visina / 2})`);
    
    //Definiranje skale i linije za radar
    const angleSlice = Math.PI * 2 / categories.length;

    const rScale = d3.scaleLinear()
        .range([0, radius]);

    const radarLine = d3.lineRadial()
        .curve(d3.curveLinearClosed)
        .radius(d => rScale(d.value))
        .angle((d, i) => i * angleSlice);

    function updateChart(selectedYear) {
        let filteredDataset = dataset;
        if (selectedYear !== "All") {
            filteredDataset = dataset.filter(d => d.year === selectedYear);
        }

        const dataByCategory = d3.rollups(
            filteredDataset,
            v => v.length,
            d => d.category
        );

        const dataMap = new Map(dataByCategory);
        const data = categories.map(category => ({
            category: category,
            value: dataMap.get(category) || 0
        }));

        rScale.domain([0, d3.max(data, d => d.value)]);

        const gridCircles = svg.selectAll(".gridCircle")
            .data(d3.range(1, 6).reverse());

        gridCircles.enter()
            .append("circle")
            .attr("class", "gridCircle")
            .merge(gridCircles)
            .attr("r", d => radius / 5 * d)
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", 0.1);

        gridCircles.exit().remove();

        const axis = svg.selectAll(".axis")
            .data(categories);

        axis.enter()
            .append("line")
            .attr("class", "axis")
            .merge(axis)
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => rScale(d3.max(data, d => d.value) * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y2", (d, i) => rScale(d3.max(data, d => d.value) * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
            .style("stroke", "white")
            .style("stroke-width", "2px");

        axis.exit().remove();

        const labels = svg.selectAll(".label")
            .data(categories);

        labels.enter()
            .append("text")
            .attr("class", "label")
            .merge(labels)
            .attr("text-anchor", "middle")
            .attr("x", (d, i) => rScale(d3.max(data, d => d.value) * 1.2) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y", (d, i) => rScale(d3.max(data, d => d.value) * 1.2) * Math.sin(angleSlice * i - Math.PI / 2))
            .text(d => d)
            .style("font-size", "11px");

        labels.exit().remove();

        const radarArea = svg.selectAll(".radarArea")
            .data([data]);

        radarArea.enter()
            .append("path")
            .attr("class", "radarArea")
            .attr("d", radarLine)
            .merge(radarArea)
            .transition()  
            .duration(300)
            .attr("d", radarLine);

        radarArea.exit().remove();

        // Ažuriraj naslov s odabranom godinom
        const naslov = d3.select("#naslov");
        naslov.text(selectedYear === "All" ? "Sve godine" : `Godina: ${selectedYear}`);
    }
    //Kreiranje izbornika za odabir godine
    const yearSelect = d3.select("#radar")
        .append("select")
        .attr("id", "yearSelect")
        .on("change", function () {
            const selectedYear = this.value === "All" ? "All" : +this.value;
            updateChart(selectedYear);
        });

    yearSelect.selectAll("option")
        .data(years)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);
    
    //Inicijalizacija dijagrama sa svim podacima
    updateChart("All");

    let currentIndex = 0;
    d3.select("#iduca-godina").on("click", () => {
        currentIndex = (currentIndex + 1) % years.length;
        const nextYear = years[currentIndex];
        yearSelect.property("value", nextYear);
        updateChart(nextYear);
    });
}

drawRadarChart();
