async function drawSunburst() {

    // Pristup podacima
    const dataset = await d3.json("nobel-prize.json");

    // Definiranje dimenzija
    const dimenzije = {
        sirina: 800,
        visina: 600,
    };
    const radius = Math.min(dimenzije.sirina, dimenzije.visina) / 2;

    const svg = d3.select("#sunburst")
        .append("svg")
        .attr("width", dimenzije.sirina)
        .attr("height", dimenzije.visina)
        .append("g")
        .attr("transform", `translate(${dimenzije.sirina / 2}, ${dimenzije.visina / 2})`);

    //Grupiranje podataka
    const nestedData = d3.rollup(
        dataset,
        v => d3.rollup(v, vv => vv.length, d => d.category),
        d => d.gender
    );

    //Kreiranje hijerarhijskih podataka
    const hierarchyData = { name: "root", children: Array.from(nestedData, ([key, value]) => ({ name: key, children: Array.from(value, ([k, v]) => ({ name: k, value: v })) })) };

    // Kreiranje hijerarhijskog objekta i particija
    const root = d3.hierarchy(hierarchyData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    const partition = d3.partition()
        .size([2 * Math.PI, radius]);

    partition(root);

    // Definiranje luka
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .innerRadius(d => d.y0)
        .outerRadius(d => d.y1);

    //Skala boja
    const color = d3.scaleOrdinal()
        .domain(["male", "female", "org"])
        .range(["#0d3b66", "#f4d35e", "#f95738"]);

    //Crtanje sunburst-a
    svg.selectAll("path")
        .data(root.descendants().filter(d => d.depth))
        .enter().append("path")
        .attr("d", arc)
        .attr("fill", d => d.depth === 1 ? color(d.data.name) : color(d.parent.data.name))
        .attr("stroke", "white")
        .style("stroke-width", "1px")
        .style("opacity", 0.7)
        .append("title")
        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join(" -> ")}\n${d.value}`);
    
    const capitalizeFirstLetter = str => str.charAt(0).toUpperCase() + str.slice(1);

    // Dodavanje labela
    svg.selectAll(".gender-label")
        .data(root.descendants().filter(d => d.depth === 1))
        .enter().append("text")
        .attr("class", "gender-label")
        .attr("transform", d => {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        })
        .attr("dx", "-20")
        .attr("dy", ".5em")
        .text(d => capitalizeFirstLetter(d.data.name))
        .style("font-size", "15px")
        .style("text-anchor", "middle");

    svg.selectAll(".category-label")
        .data(root.descendants().filter(d => d.depth === 2))
        .enter().append("text")
        .attr("class", "category-label")
        .attr("transform", d => {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        })
        .attr("dx", "-20")
        .attr("dy", ".5em")
        .text(d => capitalizeFirstLetter(d.data.name))
        .style("font-size", "12px")
        .style("text-anchor", "middle");
}

drawSunburst();
