async function drawBoxPlot() {

    // Pristup podacima
    const dataset = await d3.json("nobel-prize.json");

    const dimenzije = {
        sirina: 600,
        visina: 600,
        margine: {
            top: 30,
            right: 30,
            bottom: 50,
            left: 50,
        },
    };
    dimenzije.grSirina = dimenzije.sirina - dimenzije.margine.left - dimenzije.margine.right;
    dimenzije.grVisina = dimenzije.visina - dimenzije.margine.top - dimenzije.margine.bottom;

    const svg = d3.select("#box-plot")
        .append("svg")
        .attr("width", dimenzije.sirina)
        .attr("height", dimenzije.visina);

    const granice = svg.append("g")
        .attr("transform", `translate(${dimenzije.margine.left},${dimenzije.margine.top})`);

    // Grupiranje podataka
    const genderData = d3.groups(dataset, d => d.gender)
        .filter(([key]) => key === "male" || key === "female")
        .map(([key, values]) => ({
            gender: key,
            ages: values.map(d => d.year - parseInt(d.born))
        }));
    
    // Definiranje skala
    const xScale = d3.scaleBand()
        .domain(genderData.map(d => d.gender))
        .range([0, dimenzije.grSirina])
        .paddingInner(1)
        .paddingOuter(0.5);

    const yScale = d3.scaleLinear()
        .domain([d3.min(genderData, d => d3.min(d.ages)), d3.max(genderData, d => d3.max(d.ages))])
        .nice()
        .range([dimenzije.grVisina, 0]);

    granice.append("g")
        .attr("transform", `translate(0,${dimenzije.grVisina})`)
        .call(d3.axisBottom(xScale));

    granice.append("g")
        .call(d3.axisLeft(yScale));
    
    // Kreiranje boxplot elemenata
    const boxWidth = 100;

    genderData.forEach(d => {
        const q1 = d3.quantile(d.ages, 0.25);
        const median = d3.quantile(d.ages, 0.5);
        const q3 = d3.quantile(d.ages, 0.75);
        const interQuantileRange = q3 - q1;
        const min = d3.max([d3.min(d.ages), q1 - 1.5 * interQuantileRange]);
        const max = d3.min([d3.max(d.ages), q3 + 1.5 * interQuantileRange]);

        granice.append("line")
            .attr("x1", xScale(d.gender) - boxWidth / 2)
            .attr("x2", xScale(d.gender) + boxWidth / 2)
            .attr("y1", yScale(min))
            .attr("y2", yScale(min))
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        granice.append("line")
            .attr("x1", xScale(d.gender) - boxWidth / 2)
            .attr("x2", xScale(d.gender) + boxWidth / 2)
            .attr("y1", yScale(max))
            .attr("y2", yScale(max))
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        granice.append("rect")
            .attr("x", xScale(d.gender) - boxWidth / 2)
            .attr("y", yScale(q3))
            .attr("height", yScale(q1) - yScale(q3))
            .attr("width", boxWidth)
            .attr("fill", "#F4D35E")
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        granice.append("line")
            .attr("x1", xScale(d.gender) - boxWidth / 2)
            .attr("x2", xScale(d.gender) + boxWidth / 2)
            .attr("y1", yScale(median))
            .attr("y2", yScale(median))
            .attr("stroke", "#9c1d04")
            .attr("stroke-width", 2);

        granice.append("line")
            .attr("x1", xScale(d.gender))
            .attr("x2", xScale(d.gender))
            .attr("y1", yScale(min))
            .attr("y2", yScale(q1))
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        granice.append("line")
            .attr("x1", xScale(d.gender))
            .attr("x2", xScale(d.gender))
            .attr("y1", yScale(q3))
            .attr("y2", yScale(max))
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        d.ages.forEach(age => {
            if (age < min || age > max) {
                granice.append("circle")
                    .attr("cx", xScale(d.gender))
                    .attr("cy", yScale(age))
                    .attr("r", 3)
                    .attr("fill", "orange")
                    .attr("stroke", "black")
                    .attr("stroke-width", 1);
            }
        });
    });
}

drawBoxPlot();
