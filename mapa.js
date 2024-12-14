async function crtajMapu() {
    const oblikDrzava = await d3.json('world-geojson.json');
    const imeDrzaveAccessor = d => d.properties.NAME;
  
    const dataset = await d3.json("nobel-prize.json");
  
    let metrikaPoDrzavi = {};
  
    dataset.forEach(d => {
      const country = d["bornCountry"];
      if (!metrikaPoDrzavi[country]) {
        metrikaPoDrzavi[country] = 0;
      }
      metrikaPoDrzavi[country]++;
    });
    
    //Postavljanje dimenzija
    let dimenzije = {
      sirina: window.innerWidth, // Koristi cijelu širinu prozora
      visina: 600, // Fiksna visina za kvadratni prikaz
      margine: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      },
    };
    dimenzije.grSirina = dimenzije.sirina 
      - dimenzije.margine.left - dimenzije.margine.right;
    dimenzije.grVisina = dimenzije.visina 
      - dimenzije.margine.top - dimenzije.margine.bottom;
    
    //Postavljanjr projekcije i putanje
    const projekcija = d3.geoEckert3()
      .scale(dimenzije.grSirina / (2 * Math.PI))
      .translate([dimenzije.grSirina / 2, dimenzije.grVisina / 2]);
  
    const putanjaGeneratora = d3.geoPath(projekcija);
    
    const okvir = d3.select("#mapa")
      .append("svg")
      .attr("width", "100%")
      .attr("height", dimenzije.visina)
      .attr("viewBox", `0 0 ${dimenzije.sirina} ${dimenzije.visina}`)
      .call(d3.zoom().on("zoom", (event) => {
        granice.attr("transform", event.transform);
      }));
    
    //Dodavanje granica i mreže
    const granice = okvir.append("g");
  
    const zemlja = granice.append("path")
      .attr("class", "zemlja")
      .attr("d", putanjaGeneratora({ type: "Sphere" }))
      .attr("fill", "lightblue");
  
    const mrezaJson = d3.geoGraticule10();
  
    const mreza = granice.append("path")
      .attr("class", "mreza")
      .attr("d", putanjaGeneratora(mrezaJson));
  
    const vrijednosti = Object.values(metrikaPoDrzavi);
    const graniceVrijednosti = d3.extent(vrijednosti);
  
    const maxPromjena = d3.max([0, graniceVrijednosti[1]]);
    const skalaBoja = d3.scaleLinear()
      .domain([0, maxPromjena/2,maxPromjena])
      .range(["#F4D35E", "#e7931e", "#c47530"]);
    

    //Crtanje zemalja i bojenje prema metrikama
    const drzave = granice.selectAll(".drzava")
      .data(oblikDrzava.features)
      .enter().append("path")
      .attr("class", "drzava")
      .attr("d", putanjaGeneratora)
      .attr("fill", d => {
        const vr = metrikaPoDrzavi[imeDrzaveAccessor(d)];
        if (typeof vr == "undefined") return "#e3e6e9";
        return skalaBoja(vr);
      });
    
    //Dodavanje interaktivnosti
    drzave
      .on("mouseenter", (e, d) => onMouseEnter(e, d))
      .on("mouseleave", onMouseLeave);
  
    const detalji = d3.select("#mapa").append("div")
        .attr("class", "detalji")
        .style("position", "absolute")
        .style("display", "none");
  
    function onMouseEnter(e, d) {
      detalji
        .style("left", `${e.pageX + 10}px`)
        .style("top", `${e.pageY - 20}px`)
        .style("display", "block")
        .style("opacity", 1)
        .html(`
          Država: ${imeDrzaveAccessor(d)}<br>
          Vrijednost: ${metrikaPoDrzavi[imeDrzaveAccessor(d)] || 0}
        `);
    }
  
    function onMouseLeave() {
      detalji.style("display", "none");
    }
    
    //Dodavanje legende
    const legendaGrupa = okvir.append("g")
      .attr("transform", `translate(120,${
        dimenzije.sirina < 800
        ? dimenzije.grVisina - 30
        : dimenzije.grVisina * 0.5
      })`);
  
    const legendaNaslov = legendaGrupa.append("text")
      .attr("y", -23)
      .attr("class", "legenda-naslov");
  
    const legandaOpis = legendaGrupa.append("text")
      .attr("y", -9)
      .attr("class", "legenda-opis")
      .text("Broj Nobelovih nagrada po državi rođenja dobitnika");
  
    const defs = okvir.append("defs");
  
    const gradijent = defs.append("linearGradient")
      .attr("id", "legNijansaId")
      .selectAll("stop")
      .data(skalaBoja.range())
      .enter().append("stop")
      .attr("stop-color", d => d)
      .attr("offset", (d, i) => `${i * 50}%`);
  
    const legednaSirina = 120;
    const legendaVisina = 16;
    const legendaNijansa = legendaGrupa.append("rect")
      .attr("x", -legednaSirina / 2)
      .attr("height", legendaVisina)
      .attr("width", legednaSirina)
      .style("fill", `url(#legNijansaId)`);
  
    const legendaVrD = legendaGrupa.append("text")
      .attr("class", "legenda-vrijednost")
      .attr("x", legednaSirina / 2 + 10)
      .attr("y", legendaVisina / 2)
      .text(`${d3.format(".1f")(maxPromjena)}`);
  
    const legendaVrL = legendaGrupa.append("text")
      .attr("class", "legenda-vrijednost")
      .attr("x", -legednaSirina / 2 - 10)
      .attr("y", legendaVisina / 2)
      .text(`0`)
      .style("text-anchor", "end");
}

crtajMapu();
