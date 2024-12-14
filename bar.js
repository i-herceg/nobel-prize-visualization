async function drawBars() {
    // 1. Pristup podacima
    const dataset = await d3.json("nobel-prize.json");

    // 2. Definiranje dimenzija grafa
    const sirina = 600;
    let dimenzije = {
        sirina: sirina,
        visina: sirina * 0.6,
        margine: {
            top: 30,
            right: 10,
            bottom: 50,
            left: 50,
        },
    };
    dimenzije.grSirina = dimenzije.sirina - dimenzije.margine.left - dimenzije.margine.right;
    dimenzije.grVisina = dimenzije.visina - dimenzije.margine.top - dimenzije.margine.bottom;

    // 3. Crtanje grafa
    const okvir = d3.select("#bar")
        .append("svg")
        .attr("width", dimenzije.sirina)
        .attr("height", dimenzije.visina);

    const granice = okvir.append("g")
        .style("transform", `translate(${dimenzije.margine.left}px, ${dimenzije.margine.top}px)`);

    granice.append("g")
        .attr("class", "kosare");
    granice.append("line")
        .attr("class", "prosjek");
    granice.append("g")
        .attr("class", "x-os")
        .style("transform", `translateY(${dimenzije.grVisina}px)`)
        .append("text")
        .attr("class", "x-os-oznaka")
        .attr("x", dimenzije.grSirina / 2)
        .attr("y", dimenzije.margine.bottom - 10)
        .text("Dob");

    const crtajHistogram = (dataset, metrika) => {
        const metrikaAccessor = d => d[metrika];
        const yAccessor = d => d.length;

        // 4. Definiranje razmjera
        const xSkala = d3.scaleLinear()
            .domain([d3.min(dataset, metrikaAccessor), d3.max(dataset, metrikaAccessor)])
            .range([0, dimenzije.grSirina])
            .nice();

        const kosGenerator = d3.histogram()
            .domain(xSkala.domain())
            .value(metrikaAccessor)
            .thresholds(xSkala.ticks(10));

        const kosare = kosGenerator(dataset);

        const ySkala = d3.scaleLinear()
            .domain([0, d3.max(kosare, yAccessor)])
            .range([dimenzije.grVisina, 0])
            .nice();

        // 5. Crtanje podataka
        const barPadding = 1;

        const izlazTranzicija = d3.transition().duration(600);
        const novaTranzicija = izlazTranzicija.transition().duration(600);

        let sveKosare = granice.select(".kosare")
            .selectAll(".kosara")
            .data(kosare);

        const stareKosare = sveKosare.exit();

        stareKosare.selectAll("rect")
            .transition(izlazTranzicija)
            .style("fill", "#9c1d04")
            .attr("y", dimenzije.grVisina)
            .attr("height", 0);

        stareKosare.selectAll("text")
            .transition(izlazTranzicija)
            .attr("y", dimenzije.grVisina);

        stareKosare
            .transition(izlazTranzicija)
            .remove();

        const noveKosare = sveKosare.enter().append("g")
            .attr("class", "kosara");

        noveKosare.append("rect")
            .attr("x", d => xSkala(d.x0) + barPadding)
            .attr("y", dimenzije.grVisina)
            .attr("width", d => d3.max([0, xSkala(d.x1) - xSkala(d.x0) - barPadding]))
            .attr("height", 0)
            .style("fill", "#0D3B66");

        noveKosare.append("text")
            .attr("x", d => xSkala(d.x0) + (xSkala(d.x1) - xSkala(d.x0)) / 2)
            .attr("y", dimenzije.grVisina);

        sveKosare = noveKosare.merge(sveKosare);

        // Osvježavamo kosare za prikaz novih podataka
        sveKosare.select("rect")
            .transition(novaTranzicija)
            .attr("x", d => xSkala(d.x0) + barPadding)
            .attr("y", d => ySkala(yAccessor(d)))
            .attr("width", d => d3.max([0, xSkala(d.x1) - xSkala(d.x0) - barPadding]))
            .attr("height", d => dimenzije.grVisina - ySkala(yAccessor(d)))
            .transition()
            .style("fill", "#F4D35E");

        sveKosare.select("text")
            .transition(novaTranzicija)
            .attr("x", d => xSkala(d.x0) + (xSkala(d.x1) - xSkala(d.x0)) / 2)
            .attr("y", d => ySkala(yAccessor(d)) - 5)
            .text(d => yAccessor(d) || "");

        const srVr = d3.mean(dataset, metrikaAccessor);

        granice.selectAll(".prosjek")
            .transition(novaTranzicija)
            .attr("x1", xSkala(srVr))
            .attr("x2", xSkala(srVr))
            .attr("y1", -20)
            .attr("y2", dimenzije.grVisina);

        // 6. Crtanje pomocne grafike
        const xOsGenerator = d3.axisBottom()
            .scale(xSkala)
            .tickFormat(d3.format("d")); // Formatiramo kao cijele brojeve

        const xOs = granice.select(".x-os")
            .transition(novaTranzicija)
            .call(xOsGenerator);

        xOs.select(".x-os-oznaka")
            .text(metrika);
    };

    const filtrirajDataset = (dataset, gender) => {
        return dataset.filter(d => d.gender === gender).map(d => {
            return {
                Dob: d.year - parseInt(d.born),
                year: d.year,
                born: d.born,
                category: d.category
            };
        });
    };

    let currentGender = "male";
    let currentCategoryIndex = 0;
    const categories = ["physics", "chemistry", "medicine", "literature", "peace", "economics"];
    let prikazaniPodaci = filtrirajDataset(dataset, currentGender);
    console.log(prikazaniPodaci);
    crtajHistogram(prikazaniPodaci, "Dob");

    const button = d3.select("#botuni")
        .append("button")
        .text("Metrika po spolu");

    const categoryButton = d3.select("#botuni")
        .append("button")
        .text("Metrika po kategorijama");

    const naslov = d3.select("#spol");
    naslov.text(currentGender === "male" ? "Muški spol" : "Ženski spol");

    button.node().addEventListener("click", () => {
        currentGender = currentGender === "male" ? "female" : "male";
        prikazaniPodaci = filtrirajDataset(dataset, currentGender);
        crtajHistogram(prikazaniPodaci, "Dob");

        // Ažuriraj naslov s trenutnim spolom
        const naslov = d3.select("#spol");
        naslov.text(currentGender === "male" ? "Muški spol" : "Ženski spol");
    });

    categoryButton.node().addEventListener("click", () => {
        currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
        const currentCategory = categories[currentCategoryIndex];

        const filteredByCategory = dataset.filter(d => d.category === currentCategory);
        prikazaniPodaci = filtrirajDataset(filteredByCategory, currentGender);
        crtajHistogram(prikazaniPodaci, "Dob");

        // Ažuriraj naslov s trenutnom kategorijom
        const naslov = d3.select("#spol");
        naslov.text(`${currentGender === "male" ? "Muški spol" : "Ženski spol"} - ${currentCategory}`);
    });
}

drawBars();
