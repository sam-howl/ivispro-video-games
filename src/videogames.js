const height = 600,
  width = 800;
const chartMargin = { top: 40, right: 30, bottom: 70, left: 70 },
  chartWidth = width - chartMargin.left - chartMargin.right,
  chartHeight = height - chartMargin.top - chartMargin.bottom;

// Bubble Genre
const svgBubble = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const pack = d3.pack().size([width, height]).padding(1.5);
const format = d3.format(",d");

d3.json("data/game_data.json").then(function (games) {
  let genres = games[0].genres;
  let gamesWithout2020 = [];
  for (let index = 1; index < games.length; index++) {
    // get all genres
    genres = genres.concat(games[index].genres);
    // remove games released in 2020, because the year is not yet finished and would only falsify the diagrams
    // remove games released before 1990, because there is basically no data present
    if (
      !games[index].released.match(/2020./) &&
      !games[index].released.match(/198./) &&
      !games[index].released.match(/197./)
    ) {
      gamesWithout2020.push(games[index]);
    }
  }
  games = gamesWithout2020;

  // count games in genres
  const genreCount = d3
    .nest()
    .key((d) => d.name)
    .rollup((v) => v.length)
    .entries(genres);
  const maxGenre = d3.max(genreCount);

  // color depending on number of games
  const color = d3
    .scaleLinear()
    .domain([0, maxGenre.value])
    .range(["#dcedc8", "#1a237e"])
    .interpolate(d3.interpolateHcl);

  const root = d3.hierarchy({ children: genreCount }).sum(function (d) {
    return d.value;
  });

  var bubblePressed = undefined;

  // visualize the selected genre
  function changeBubbleClass(id) {
    if (!bubblePressed) {
      bubblePressed = document.getElementById(id);
      bubblePressed.classList.add("bubble-pressed");
      bubblePressed.classList.remove("bubble");
    } else if (bubblePressed.id !== id) {
      bubblePressed.classList.remove("bubble-pressed");
      bubblePressed.classList.add("bubble");
      bubblePressed = document.getElementById(id);
      bubblePressed.classList.add("bubble-pressed");
      bubblePressed.classList.remove("bubble");
    }
  }

  // bubbles
  const node = svgBubble
    .selectAll(".node")
    .data(pack(root).leaves())
    .enter()
    .append("g")
    .attr("class", "node bubble")
    .attr("id", (d) => "node-" + d.data.key)
    .attr("transform", (d) => "translate(" + d.x + "," + d.y + ")")
    .on("click", (d) => {
      changeBubbleClass("node-" + d.data.key);
      var gamesPerGenre = games.filter((game) =>
        game.genres.some((genre) => genre.name === d.data.key)
      );
      const genreName =
        d.data.key === "Massively Multiplayer" ? "MMO" : d.data.key;
      // load all other charts with selected genre
      lineChartPrice(gamesPerGenre, genreName);
      lineChartRating(gamesPerGenre, genreName);
      scatterCharts(gamesPerGenre, genreName);
    });

  node
    .append("circle")
    .attr("id", (d) => d.data.key)
    .attr("r", (d) => d.r)
    .style("fill", (d) => color(d.value));

  // information about the genre bubble
  node.append("title").text((d) => d.data.key + "\n" + format(d.value));

  // bubble text
  node
    .append("text")
    .attr("dy", ".2em")
    .style("text-anchor", "middle")
    .text((d) => {
      if (d.r > 19) {
        return d.data.key === "Massively Multiplayer" ? "MMO" : d.data.key;
      }
      return null;
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", (d) => d.r / 3)
    .attr("fill", "white");

  barChartReleases(games);
});

function barChartReleases(games) {
  const svgBarReleases = d3
    .select("#barChart")
    .append("svg")
    .attr("width", chartWidth + chartMargin.left + chartMargin.right)
    .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
    .append("g")
    .attr(
      "transform",
      "translate(" + chartMargin.left + "," + chartMargin.top + ")"
    )
    .style("border", "1px solid");

  // get the release years with the number of games
  const releaseYears = d3
    .nest()
    .key((d) => {
      if (d.released) {
        let splitted = d.released.split("-");
        return splitted[0];
      }
    })
    .rollup((v) => v.length)
    .sortKeys(d3.ascending)
    .entries(games);

  const maxReleases = d3.max(releaseYears, function (d) {
    return +d.value;
  });

  // X axis
  const x = d3
    .scaleBand()
    .range([0, chartWidth])
    .domain(releaseYears.map((d) => d.key))
    .padding(0.2);
  svgBarReleases
    .append("g")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  svgBarReleases
    .append("text")
    .attr(
      "transform",
      "translate(" +
        chartWidth / 2 +
        " ," +
        (chartHeight + chartMargin.top + 20) +
        ")"
    )
    .style("text-anchor", "middle")
    .text("RELEASE YEAR");

  // Y axis
  const y = d3
    .scaleLinear()
    .domain([0, Math.round(maxReleases / 1000) * 1000])
    .range([chartHeight, 0]);
  svgBarReleases.append("g").call(d3.axisLeft(y));
  svgBarReleases
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - chartMargin.left)
    .attr("x", 0 - chartHeight / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("NUMBER OF GAMES");

  // Bars
  svgBarReleases
    .selectAll("mybar")
    .data(releaseYears)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.key))
    .attr("y", (d) => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", (d) => chartHeight - y(d.value))
    .attr("fill", "#12a1a3")
    .append("title")
    .text((d) => "Year: " + d.key + "\n" + format(d.value));

  // information about the year bar
  svgBarReleases
    .append("text")
    .attr("x", chartWidth / 2)
    .attr("y", 0 - chartMargin.top / 2)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .text("Overall releases per year");
}

function lineChartPrice(games, genreName) {
  // remove the elements, so they are not added every time again when the genre changes
  d3.select("#svgLinePrices").remove();
  d3.select("#lineDescription").remove();

  document.getElementById(
    "lineChart"
  ).innerHTML += `<p id="lineDescription">There is a tendency that the price increased over the time and the rating is steady or decreased.
  But there are some exceptions. Try out several genres to see the connection between the average price and average rating.</p>`;

  const svgLinePrices = d3
    .select("#lineChart")
    .append("svg")
    .attr("id", "svgLinePrices")
    .attr("width", chartWidth + chartMargin.left + chartMargin.right)
    .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
    .append("g")
    .attr(
      "transform",
      "translate(" + chartMargin.left + "," + chartMargin.top + ")"
    );

  const data = [];
  for (let game of games) {
    let year = game.released.split("-")[0];
    game.released = year;
    data.push(game);
  }
  const gamesByYear = d3
    .nest()
    .key((d) => d.released)
    .rollup((v) => d3.mean(v, (d) => d.initialprice) / 100)
    .sortKeys(d3.ascending)
    .entries(data);

  // X axis
  const x = d3
    .scaleLinear()
    .domain(d3.extent(gamesByYear, (d) => d.key))
    .range([0, chartWidth]);

  svgLinePrices
    .append("g")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")));

  svgLinePrices
    .append("text")
    .attr(
      "transform",
      "translate(" +
        chartWidth / 2 +
        " ," +
        (chartHeight + chartMargin.top + 10) +
        ")"
    )
    .style("text-anchor", "middle")
    .text("YEAR");

  // Y axis
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(gamesByYear, (d) => +d.value)])
    .range([chartHeight, 0]);
  svgLinePrices.append("g").call(d3.axisLeft(y));

  svgLinePrices
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - chartMargin.left)
    .attr("x", 0 - chartHeight / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("AVERAGE PRICE IN $");

  // tooltip and circle for more information
  const bisect = d3.bisector((d) => d.key).left;

  const focus = svgLinePrices
    .append("g")
    .append("circle")
    .style("fill", "none")
    .attr("stroke", "white")
    .attr("r", 8.5)
    .style("opacity", 0);

  const focusText = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip-lineprice")
    .style("opacity", 0);

  svgLinePrices
    .append("rect")
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);

  // Add the price line
  svgLinePrices
    .append("path")
    .datum(gamesByYear)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 3)
    .attr(
      "d",
      d3
        .line()
        .x((d) => x(d.key))
        .y((d) => y(d.value))
    );

  svgLinePrices
    .append("text")
    .attr("x", chartWidth / 2)
    .attr("y", 0 - chartMargin.top / 2)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .text("Average price of genre '" + genreName + "' over years");

  // show tooltip with circle
  function mouseover() {
    focus.style("opacity", 1);
    focusText.style("opacity", 1);
  }

  // get information according to mouse coordinate
  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]);
    var i = bisect(gamesByYear, x0, 1);

    selectedData = gamesByYear[i];

    focus.attr("cx", x(selectedData.key)).attr("cy", y(selectedData.value));
    var html =
      "<b> Year: " +
      selectedData.key +
      "</b><br/>" +
      "<b> Avg. Price: $" +
      Math.round((selectedData.value + Number.EPSILON) * 100) / 100 +
      "</b> ";

    focusText
      .html(html)
      .style("left", d3.event.pageX + 15 + "px")
      .style("top", d3.event.pageY - 28 + "px")
      .transition()
      .duration(200)
      .style("opacity", 0.9);
  }

  // hide tooltip with circle
  function mouseout() {
    focus.style("opacity", 0);
    focusText.transition().duration(300).style("opacity", 0);
  }
}

function lineChartRating(games, genreName) {
  d3.select("#svgLineRatings").remove();

  const svgLineRatings = d3
    .select("#lineChart")
    .append("svg")
    .attr("id", "svgLineRatings")
    .attr("width", chartWidth + chartMargin.left + chartMargin.right)
    .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
    .append("g")
    .attr(
      "transform",
      "translate(" + chartMargin.left + "," + chartMargin.top + ")"
    );

  const data = [];
  for (let game of games) {
    let year = game.released.split("-")[0];
    game.released = year;
    data.push(game);
  }
  const gamesByYear = d3
    .nest()
    .key((d) => d.released)
    .rollup((v) => d3.mean(v, (d) => d.rating) * 100)
    .sortKeys(d3.ascending)
    .entries(data);

  // X axis
  const x = d3
    .scaleLinear()
    .domain(d3.extent(gamesByYear, (d) => d.key))
    .range([0, chartWidth]);

  svgLineRatings
    .append("g")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")));

  svgLineRatings
    .append("text")
    .attr(
      "transform",
      "translate(" +
        chartWidth / 2 +
        " ," +
        (chartHeight + chartMargin.top + 10) +
        ")"
    )
    .style("text-anchor", "middle")
    .text("YEAR");

  // Y axis
  const y = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]);
  svgLineRatings.append("g").call(d3.axisLeft(y));

  svgLineRatings
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - chartMargin.left)
    .attr("x", 0 - chartHeight / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("AVERAGE RATING IN %");

  // tooltip and circle for more information
  const bisect = d3.bisector((d) => d.key).left;

  const focus = svgLineRatings
    .append("g")
    .append("circle")
    .style("fill", "none")
    .attr("stroke", "white")
    .attr("r", 8.5)
    .style("opacity", 0);

  const focusText = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip-linerating")
    .style("opacity", 0);

  svgLineRatings
    .append("rect")
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);

  // Add the price line
  svgLineRatings
    .append("path")
    .datum(gamesByYear)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 3)
    .attr(
      "d",
      d3
        .line()
        .x((d) => x(d.key))
        .y((d) => y(d.value))
    );

  svgLineRatings
    .append("text")
    .attr("x", chartWidth / 2)
    .attr("y", 0 - chartMargin.top / 2)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .text("Average rating of genre '" + genreName + "' over years");

  // show tooltip with circle
  function mouseover() {
    focus.style("opacity", 1);
    focusText.style("opacity", 1);
  }

  // get information according to mouse coordinate
  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]);
    var i = bisect(gamesByYear, x0, 1);

    selectedData = gamesByYear[i];

    focus.attr("cx", x(selectedData.key)).attr("cy", y(selectedData.value));
    var html =
      "<b> Year: " +
      selectedData.key +
      "</b><br/>" +
      "<b> Avg. Rating: " +
      Math.round((selectedData.value + Number.EPSILON) * 100) / 100 +
      "%</b> ";

    focusText
      .html(html)
      .style("left", d3.event.pageX + 15 + "px")
      .style("top", d3.event.pageY - 28 + "px")
      .transition()
      .duration(200)
      .style("opacity", 0.9);
  }

  // hide tooltip with circle
  function mouseout() {
    focus.style("opacity", 0);
    focusText.transition().duration(300).style("opacity", 0);
  }
}

function scatterCharts(games, genreName) {
  const data = [];
  for (let game of games) {
    let year = game.released.split("-")[0];
    game.released = year;
    data.push(game);
  }
  const gamesByYear = d3
    .nest()
    .key((d) => d.released)
    .rollup((v) => d3.mean(v, (d) => d.initialprice) / 100)
    .sortKeys(d3.ascending)
    .entries(data);

  // Buttons for year selection
  const btnGroup = document.getElementById("btn-group");
  if (btnGroup) {
    btnGroup.parentNode.removeChild(btnGroup);
    document.getElementById("scatterDescription").remove();
    d3.select("#svgPriceScatter").remove();
  }

  document.getElementById("scatterChart").innerHTML +=
    `<p id="scatterDescription">Shouldn't it be that games with higher prices bring more content and therefore have a higher playtime?
    Could a higher playtime also have an impact to a better rating?<br/></br>
    Have a look by yourself! You could be surprised.<br/></br>
    Select any year to see the information from a specific year. To see all data again, just press all.</p>
  <div id="btn-group" class="btn-group" style="width:${chartWidth}">

   <button id="yearbutton-all" class="button-pressed">All</button>` +
    gamesByYear
      .map(
        (entry) =>
          `<button id="yearbutton-${entry.key}" class="btn" >${entry.key}</button>`
      )
      .join(" ") +
    `</div>`;

  // visualize selection of year
  let buttonPressed = document.getElementById("yearbutton-all");
  function changeButtonClass(id) {
    if (buttonPressed.id !== id) {
      buttonPressed.classList.remove("button-pressed");
      buttonPressed.classList.add("btn");
      buttonPressed = document.getElementById(id);
      buttonPressed.classList.add("button-pressed");
      buttonPressed.classList.remove("btn");
    }
  }

  // draw charts for the selected year
  document.getElementById("yearbutton-all").addEventListener("click", () => {
    drawScatterPriceChart(games, undefined);
    changeButtonClass("yearbutton-all");
  });

  for (let year of gamesByYear) {
    document
      .getElementById("yearbutton-" + year.key)
      .addEventListener("click", () => {
        let gamesFilteredByYear = data.filter(
          (game) => game.released === year.key
        );
        drawScatterPriceChart(gamesFilteredByYear, year.key);
        changeButtonClass("yearbutton-" + year.key);
      });
  }

  drawScatterPriceChart(games, undefined);

  function drawScatterPriceChart(filteredGames, year) {
    const legendDiv = document.getElementById("scatterLegend");
    legendDiv.innerHTML = "";
    d3.select("#svgPriceScatter").remove();
    d3.select("#tooltip-price").remove();

    const svgPriceScatter = d3
      .select("#scatterChart")
      .append("svg")
      .attr("id", "svgPriceScatter")
      .attr("width", chartWidth + chartMargin.left + chartMargin.right)
      .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
      .append("g")
      .attr(
        "transform",
        "translate(" + chartMargin.left + "," + chartMargin.top + ")"
      );

    const maxPrice = d3.max(filteredGames, (d) => +(d.initialprice / 100));
    const maxPlaytime = d3.max(filteredGames, (d) => +(d.average_forever / 60));
    const ratingDomain = [0, 100];

    const colorScale = d3
      .scaleLinear()
      .domain(ratingDomain)
      .range(["#dcedc8", "#1a237e"])
      .interpolate(d3.interpolateHcl);

    // X axis
    const x = d3
      .scaleLinear()
      .domain([0, maxPlaytime > 350 ? 350 : maxPlaytime])
      .range([0, chartWidth]);
    svgPriceScatter
      .append("g")
      .attr("transform", "translate(0," + chartHeight + ")")
      .call(d3.axisBottom(x));

    svgPriceScatter
      .append("text")
      .attr(
        "transform",
        "translate(" +
          chartWidth / 2 +
          " ," +
          (chartHeight + chartMargin.top + 20) +
          ")"
      )
      .style("text-anchor", "middle")
      .text("AVERAGE PLAYTIME IN HOURS");

    // Y axis
    const y = d3
      .scaleLinear()
      .domain([0, maxPrice > 100 ? 100 : maxPrice])
      .range([chartHeight, 0]);
    svgPriceScatter.append("g").call(d3.axisLeft(y));

    svgPriceScatter
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - chartMargin.left)
      .attr("x", 0 - chartHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("PRICE IN $");

    svgPriceScatter
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", 0 - chartMargin.top / 2)
      .attr("text-anchor", "middle")
      .attr("class", "chart-title")
      .text(
        "Price in comparison with playtime of genre '" +
          genreName +
          "'" +
          (!year ? " overall" : " in " + year)
      );

    // tooltip for more information
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .attr("id", "tooltip-price")
      .style("opacity", 0);

    // show tooltip
    function tipMouseover(d) {
      var html =
        d.name +
        "<br/><b> Price: $" +
        Math.round((d.initialprice / 100 + Number.EPSILON) * 100) / 100 +
        "</b><br/><b> Avg. Playtime: " +
        Math.round((d.average_forever / 60 + Number.EPSILON) * 100) / 100 +
        " hours</b> <br/><b> Rating: " +
        Math.round((d.rating * 100 + Number.EPSILON) * 100) / 100 +
        "%</b><br/>";

      tooltip
        .html(html)
        .style("left", d3.event.pageX + 15 + "px")
        .style("top", d3.event.pageY - 28 + "px")
        .transition()
        .duration(200) // ms
        .style("opacity", 0.9); // started as 0!
    }

    // hide tooltip
    function tipMouseout() {
      tooltip.transition().duration(300).style("opacity", 0);
    }

    // dots
    svgPriceScatter
      .append("g")
      .selectAll("dot")
      .data(filteredGames)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.average_forever / 60))
      .attr("cy", (d) => y(d.initialprice / 100))
      .attr("r", 5)
      .style("fill", (d) => colorScale(d.rating * 100))
      .on("mouseover", tipMouseover)
      .on("mouseout", tipMouseout);

    legendDiv.innerHTML += "<p>Rating</p>";

    // Legend inspired by: http://bl.ocks.org/syntagmatic/e8ccca52559796be775553b467593a9f
    const colorScaleLegend = d3
      .scaleLinear()
      .range(["#dcedc8", "#1a237e"])
      .domain(ratingDomain);
    const legendWidth = 80,
      legendHeight = 200,
      legendMargin = { top: 10, right: 60, bottom: 10, left: 2 };

    const legendCanvas = d3
      .select("#scatterLegend")
      .append("canvas")
      .attr("height", legendHeight - legendMargin.top - legendMargin.bottom)
      .attr("width", 1)
      .attr("id", "canvasLegend")
      .style(
        "height",
        legendHeight - legendMargin.top - legendMargin.bottom + "px"
      )
      .style(
        "width",
        legendWidth - legendMargin.left - legendMargin.right + "px"
      )
      .style("border", "1px solid #000")
      .style("position", "absolute")
      .style("top", legendMargin.top + "px")
      .style("left", legendMargin.left + "px")
      .node();

    const ctx = legendCanvas.getContext("2d");

    const legendScale = d3
      .scaleLinear()
      .range([1, legendHeight - legendMargin.top - legendMargin.bottom])
      .domain(ratingDomain.reverse());

    const image = ctx.createImageData(1, legendHeight);
    d3.range(legendHeight).forEach((i) => {
      const c = d3.rgb(colorScaleLegend(legendScale.invert(i)));
      image.data[4 * i] = c.r;
      image.data[4 * i + 1] = c.g;
      image.data[4 * i + 2] = c.b;
      image.data[4 * i + 3] = 255;
    });
    ctx.putImageData(image, 0, 0);

    const legendAxis = d3.axisRight().scale(legendScale).tickSize(6).ticks(8);

    const legendSvg = d3
      .select("#scatterLegend")
      .append("svg")
      .attr("height", legendHeight + "px")
      .attr("width", legendWidth + "px")
      .attr("id", "svgLegend")
      .style("position", "absolute")
      .style("left", "0px")
      .style("top", "0px");

    legendSvg
      .append("g")
      .attr(
        "transform",
        "translate(" +
          (legendWidth - legendMargin.left - legendMargin.right + 3) +
          "," +
          legendMargin.top +
          ")"
      )
      .call(legendAxis);
  }
}
