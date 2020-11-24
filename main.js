var width = 1200;
var height = 800;

d3.csv("starbucksfoods.csv", function (csv) {

    for (var i = 0; i < csv.length; ++i) {
        csv[i].Calories = Number(csv[i].Calories);
        csv[i].Fat = Number(csv[i].Fat);
        csv[i].Carb = Number(csv[i].Carb);
        csv[i].Fiber = Number(csv[i].Fiber);
        csv[i].Protein = Number(csv[i].Protein);
    }

    // csv = csv.sort(function(a, b) {
    //     return d3.ascending(a.Calories, b.Calories);
    // });
    var margin = {top: 30, right: 10, bottom: 10, left: 0},
        width = 1200 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;


    var graph = d3.select("#pcp").append("svg")
        // .attr("width", width)
        // .attr("height", height)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    // var graph = d3.select("#barGraph")
    //     .append("svg")
    //     .attr("width", width)
    //     .attr("height", height);

    var dimensions = d3.keys(csv[0]).filter(function(d) {return d != "Item"});

    // For each dimension, I build a linear scale. I store all in a y object
    var y = {};
    for (i in dimensions) {
        var name = dimensions[i];
        y[name] = d3.scaleLinear()
            .domain( d3.extent(csv, function(d) { return +d[name]; }) )
            .range([height, 0])
    }

    // Build the X scale -> it find the best position for each Y axis
    x = d3.scalePoint()
        .range([0, width])
        .padding(1)
        .domain(dimensions);

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    // Draw the lines
    graph
        .selectAll("myPath")
        .data(csv)
        .enter().append("path")
        .attr("d",  path)
        .style("fill", "none")
        .style("stroke", "#69b3a2")
        .style("opacity", 0.5)
        .on('click', function(d) {
            console.log(d);
            generatePieChart(d);
        });
        // .on("mouseover", function (d, i) {
        //     d3.select(this).attr("opacity", 1);
        // })
        // .on("mouseover", function (d, i) {
        // d3.select(this).attr("opacity", 0.5);
        // });

    // Draw the axis:
    graph.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
        .data(dimensions).enter()
        .append("g")
        // I translate this element to its right position on the x axis
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        // And I build the axis with the call function
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        // Add axis title
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black");



    // var bars = graph.append("g");
    //
    // var xScale = d3.scaleLinear().range([0, width * 0.6]).domain([0, d3.max(csv, function(d) {
    //     return d.Calories;
    // })]);
    // var yScale = d3.scaleBand().rangeRound([0, height-50], 0.3).domain(csv.map(function(d) {
    //     return d.Item;
    // }));
    //
    // var yAxis = d3.axisLeft(yScale);
    // var xAxis = g => g.attr("transform", "translate(250, 20)").call(d3.axisTop(xScale));
    //
    // bars.append('g')
    //     .attr('class', 'y axis')
    //     .attr('transform', 'translate(250, 0)')
    //     .call(yAxis);
    //
    // bars
    //     .append("g")
    //     .attr("class", "x axis")
    //     .attr("transform", "translate(250," + (height - 50) + ")")
    //     .call(xAxis);
    //
    // bars
    //     .append("g")
    //     .selectAll(".bar")
    //     .data(csv)
    //     .enter()
    //     .append("rect")
    //     .attr("class", "bar")
    //     .attr("transform", "translate(220, 0)")
    //     .attr("x", 30)
    //     .attr("y", function (d) {
    //         return yScale(d.Item);
    //     })
    //     .attr("width", function (d) {
    //         // console.log(d.Calories);
    //         // console.log(xScale(d.Calories));
    //         return xScale(d.Calories);
    //         // return xScale(getValue(d));
    //     })
    //     .attr("height", function (d) {
    //         return yScale.bandwidth() * 0.8;
    //     })
    //     .on('click', function(d) {
    //         console.log(d)
    //         generatePieChart(d)
    //     });
    //
    // d3.select("#button")
    //     .style("border", "1px solid black")
    //     .text('Filter Data')
    //     .on('click', function() {
    //
    //         bars.selectAll('.bar')
    //             .filter(function(d) {
    //                 // this.style.opacity = "100";
    //                 // var selected = d.frequency >= d3.select("#cutOff").property("value");
    //                 // if (!selected) {
    //                 //     this.style.opacity = "0";
    //                 // }
    //                 // return selected;
    //
    //             })
    //             .transition()
    //             .duration(function(d) {
    //                 return Math.random() * 1000;
    //             })
    //             .delay(function(d) {
    //                 return d.frequency;
    //             })
    //             .style('fill', getSelection)
    //             .attr('width', function(d) {
    //                 return xScale(d.frequency);
    //             });
    //
    //         //change x-axis scale
    //
    //     });
    //
    // //sorting
    //
    //
    //
    // function getValue(d) {
    //
    // }
    //
    // function getSelection() {
    //     return d3.select("#nutrientSelect").property("value");
    // }

    function generatePieChart(data) {
        const radius = 200

        var color = d3.scaleOrdinal(['#4daf4a','#377eb8','#ff7f00', '#984ea3'])
        dataSet = [data.Fat, data.Carb, data.Fiber, data.Protein]
        console.log(dataSet)
        calories = [9, 4, 0, 4]
        // Set the calroies
        
        calorieSet = dataSet.map( ( elem, i ) => calories[ i ] * elem )
        console.log(calorieSet)
         var pieChart = d3.select("#pieChart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        g = pieChart.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        // Generate the pie
        var pie = d3.pie();
    
        // Generate the arcs
        var arc = d3.arc()
                    .innerRadius(0)
                    .outerRadius(radius);
    
        //Generate groups
        var arcs = g.selectAll("arc")
                    .data(pie(dataSet))
                    .enter()
                    .append("g")
                    .attr("class", "arc")
    
        //Draw arc paths
        arcs.append("path")
            .attr("fill", function(d, i) {
                console.log('COLOR')
                return color(i);
            })
            .attr("d", arc);
    }

});
