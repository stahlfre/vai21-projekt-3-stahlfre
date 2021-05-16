// snakey script
// https://observablehq.com/@d3/sankey-diagram
// data: 
// 12b4 -- Electricity production by source and total consumption, 2000-2019
// https://pxnet2.stat.fi/PXWeb/pxweb/en/StatFin/StatFin__ene__salatuo/statfin_salatuo_pxt_12b4.px/

d3.json('data/energy_v2.json')
    .then(function (nodes) {

        const variant = document.getElementById("color")
        const alignment = document.getElementById("alignment");
        // Prepare data
        const d = dataFix(nodes);
        console.log(d);

        document.getElementById("chartHeader").innerHTML = nodes.year + " " + nodes.header;


        variant.addEventListener("change", function () {
            if (variant.value == 1) {
                console.log(variant.value);
                alignment.addEventListener("change", function () {

                    createSankeyGradient(d, alignment.value);
                });

                createSankeyGradient(d, alignment.value)
            } else {
                alignment.addEventListener("change", function () {

                    createSankey(d, alignment.value);
                });

                createSankey(d, alignment.value)
            }
        });

        alignment.addEventListener("change", function () {

            createSankey(d, alignment.value);
        });

        createSankey(d, alignment.value)
    });

// Rita Sankey figur
function createSankey(data, alignment) {
    // Remove old svg
    d3.select("#chart").selectAll("svg").remove();

    const height = 200;
    const width = height * 2;
    const marginX = width * .02,
        marginY = height * .01;

    // Positionering
    const align = alignment;

    // https://github.com/d3/d3-scale-chromatic
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const sankey = d3.sankey()
        .nodeId(d => d.name)
        .nodeAlign(d3[`sankey${align[0].toUpperCase()}${align.slice(1)}`])
        .nodeWidth(8)
        .nodePadding(10)
        .extent([[2, 5], [width - 2, height - 5]]);

    const svg = d3.select("#chart").append("svg")
        .attr("viewBox", [marginX / -2, marginY / -2, width + marginX, height + marginY])
        .style('background', '#e6eff7');

    const graph = sankey(data);

    // append a defs (for definition) element to your SVG
    const defs = svg.append('defs');

    // add in the links
    var link = svg
        .append("g")
        .selectAll(".link")
        .data(graph.links)
        .join("path")
        .attr("fill", "none")
        .attr("class", "link")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", d => color(d.source.category))
        .attr("stroke-width", d => Math.max(2, d.width))
        .style('stroke-opacity', 0.4)
        .on('mouseover', function () {
            d3.select(this).style('stroke-opacity', 0.8);
        })
        .on('mouseout', function () {
            d3.select(this).style('stroke-opacity', 0.4);
        })
        .style("mix-blend-mode", "multiply");

    // add the link titles
    link.append("title").text(d => d.source.name + " → " + d.target.name + "\n" + d.value + " GWh");


    // Noder
    var node = svg
        .append("g")
        .selectAll(".node")
        .data(graph.nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .call(d3.drag()
            .subject(function (d) {
                return d;
            })
            .on("start", function () {
                this.parentNode.appendChild(this);
            })
            .on("drag", dragmove)
        );

    // rektanglar
    node.append("rect")
        .attr("x", function (d) {
            return d.x0;
        })
        .attr("y", function (d) {
            return d.y0;
        })
        .attr("height", d => {
            d.rectHeight = d.y1 - d.y0;
            return d.y1 - d.y0;
        })
        .attr("width", d => {
            d.rectWidth = d.x1 - d.x0;
            return d.x1 - d.x0;
        })
        .style("fill", function (d) {
            return (d.color = color(d.category));
        })
        .style("stroke", function (d) {
            return d3.rgb(d.color).darker(1);
        })
        .style('opacity', 0.9)
        .append("title")
        .text(d => d.name + "\n" + d.value + " GWh");


    // Titlar för  noder
    node.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 6)
        .attr("x", d => d.x0 < width * .75 ? d.x1 + 2 : d.x0 - 2)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width * .75 ? "start" : "end")
        .text(d => d.name);

    // Flytta på nodes
    // Modifierad version av: https://gist.github.com/mobidots/f86a31ce14a3227affd1c1287794d1a6
    // x-värden tillagda så de går att flytta åt alla håll.
    function dragmove(d) {
        d3.select(this)
            .select("rect")
            .attr("y", function (n) {
                n.y0 = Math.max(0, Math.min(n.y0 + d.dy, height - (n.y1 - n.y0)));
                n.y1 = n.y0 + n.rectHeight;

                return n.y0;
            })
            .attr("x", function (n) {
                n.x0 = Math.max(0, Math.min(n.x0 + d.dx, width - (n.x1 - n.x0)));
                n.x1 = n.x0 + n.rectWidth;

                return n.x0;
            });

        d3.select(this)
            .select("text")
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("x", d => d.x0 < width * .75 ? d.x1 + 2 : d.x0 - 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < width * .75 ? "start" : "end");

        sankey.update(graph);
        link.attr("d", d3.sankeyLinkHorizontal());

    }

}
// Rita Sankey figur med gradient (inte perfect)
function createSankeyGradient(data, alignment) {
    // Remove old svg
    d3.select("#chart").selectAll("svg").remove();

    const height = 200;
    const width = height * 2;
    const marginX = width * .02,
        marginY = height * .01;

    // Positionering
    const align = alignment;

    // https://github.com/d3/d3-scale-chromatic
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const sankey = d3.sankey()
        .nodeId(d => d.name)
        .nodeAlign(d3[`sankey${align[0].toUpperCase()}${align.slice(1)}`])
        .nodeWidth(8)
        .nodePadding(10)
        .extent([[2, 5], [width - 2, height - 5]]);

    const svg = d3.select("#chart").append("svg")
        .attr("viewBox", [marginX / -2, marginY / -2, width + marginX, height + marginY])
        .style('background', '#e6eff7');

    const graph = sankey(data);

    // append a defs (for definition) element to your SVG
    const defs = svg.append('defs');

    // add in the links
    var link = svg
        .append("g")
        .selectAll(".link")
        .data(graph.links)
        .join("path")
        .attr("fill", "none")
        .attr("class", "link")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", d => color(d.source.category))
        .attr("stroke-width", d => Math.max(2, d.width))
        .style('stroke-opacity', 0.4)
        .on('mouseover', function () {
            d3.select(this).style('stroke-opacity', 0.8);
        })
        .on('mouseout', function () {
            d3.select(this).style('stroke-opacity', 0.4);
        })
        .style("mix-blend-mode", "multiply");

    // add the link titles
    link.append("title").text(d => d.source.name + " → " + d.target.name + "\n" + d.value + " GWh");


    // Noder
    var node = svg
        .append("g")
        .selectAll(".node")
        .data(graph.nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .call(d3.drag()
            .subject(function (d) {
                return d;
            })
            .on("start", function () {
                this.parentNode.appendChild(this);
            })
            .on("drag", dragmove)
        );

    // rektanglar
    node.append("rect")
        .attr("x", function (d) {
            return d.x0;
        })
        .attr("y", function (d) {
            return d.y0;
        })
        .attr("height", d => {
            d.rectHeight = d.y1 - d.y0;
            return d.y1 - d.y0;
        })
        .attr("width", d => {
            d.rectWidth = d.x1 - d.x0;
            return d.x1 - d.x0;
        })
        .style("fill", function (d) {
            return (d.color = color(d.category));
        })
        .style("stroke", function (d) {
            return d3.rgb(d.color).darker(1);
        })
        .style('opacity', 0.9)
        .append("title")
        .text(d => d.name + "\n" + d.value + " GWh");


    // Titlar för  noder
    node.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 6)
        .attr("x", d => d.x0 < width * .75 ? d.x1 + 2 : d.x0 - 2)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width * .75 ? "start" : "end")
        .text(d => d.name);

    //add gradient to links
    //https://bl.ocks.org/micahstubbs/3c0cb0c0de021e0d9653032784c035e9
    link.attr('stroke', (d, i) => {
        //console.log('d from gradient stroke func', d);

        // make unique gradient ids  
        const gradientID = `gradient${i}`;

        const startColor = d.source.color;
        const stopColor = d.target.color;

        //console.log('startColor', startColor);
        //console.log('stopColor', stopColor);
        //console.log('gradientId', gradientID);
        //console.log(defs)
        const linearGradient = defs.append('linearGradient')
            .attr('id', gradientID);

        linearGradient.selectAll('stop')
            .data([
                { offset: '0%', color: startColor },
                { offset: '100%', color: stopColor }
            ])
            .enter().append('stop')
            .attr('offset', d => {
                //console.log('d.offset', d.offset);
                return d.offset;
            })
            .attr('stop-color', d => {
                //console.log('d.color', d.color);
                return d.color;
            })

        return `url(#${gradientID})`;

    });


    // Flytta på nodes
    // Modifierad version av: https://gist.github.com/mobidots/f86a31ce14a3227affd1c1287794d1a6
    // x-värden tillagda så de går att flytta åt alla håll.
    function dragmove(d) {
        d3.select(this)
            .select("rect")
            .attr("y", function (n) {
                n.y0 = Math.max(0, Math.min(n.y0 + d.dy, height - (n.y1 - n.y0)));
                n.y1 = n.y0 + n.rectHeight;

                return n.y0;
            })
            .attr("x", function (n) {
                n.x0 = Math.max(0, Math.min(n.x0 + d.dx, width - (n.x1 - n.x0)));
                n.x1 = n.x0 + n.rectWidth;

                return n.x0;
            });

        d3.select(this)
            .select("text")
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("x", d => d.x0 < width * .75 ? d.x1 + 2 : d.x0 - 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < width * .75 ? "start" : "end");

        sankey.update(graph);
        link.attr("d", d3.sankeyLinkHorizontal());

    }

}

function dataFix(nodes) {
    var j = 0
    const links = []
    for (let i = 0; i < nodes.source.length; i++) {

        nodes.source[i]["value"] = nodes.value[j];

        nodes.source[i]["name"] = nodes.source[i]["name"].charAt(0) + nodes.source[i]["name"].slice(1).toLowerCase();

        if (nodes.source[i].category == "Renewable energy" && (nodes.source[i].name != "Renewable energy")) {
            links.push({
                source: nodes.source[i].name,
                target: "Renewable energy",
                value: nodes.value[j]
            });
        } else if (nodes.source[i].category == "Fossil fuels" && (nodes.source[i].name != ("Fossil fuels and peat") && nodes.source[i].name != ("Fossil fuels"))) {
            links.push({
                source: nodes.source[i].name,
                target: "Fossil fuels",
                value: nodes.value[j]
            });
        } else if (nodes.source[i].category == "Peat" || nodes.source[i].name == "Fossil fuels") {
            links.push({
                source: nodes.source[i].name,
                target: "Fossil fuels and peat",
                value: nodes.value[j]
            });
        } else if (nodes.source[i].name == ("Fossil fuels and peat total" || "Renewable energy")) {
            links.push({
                source: nodes.source[i].name,
                target: "Total production",
                value: nodes.value[j]
            });
        } else if (nodes.source[i].category == "Imports" || nodes.source[i].category == "Production") {
            links.push({
                source: nodes.source[i].name,
                target: "Total consumption",
                value: nodes.value[j]
            });
        } else if (nodes.source[i].name != "Total production" && nodes.source[i].name != "Total consumption") {
            links.push({
                source: nodes.source[i].name,
                target: "Total production",
                value: nodes.value[j]
            });
        }
        j += 4;
    }
    //var new_links=links.reverse();
    return { nodes: nodes.source, links: links };
}