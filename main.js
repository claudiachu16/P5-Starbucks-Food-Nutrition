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

    csv = csv.sort(function(a, b) {
        return d3.ascending(a.Calories, b.Calories);
    });

    var graph = d3.select("#barGraph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var bars = graph.append("g");

    var xScale = d3.scaleLinear().range([0, width]).domain([0, d3.max(csv, function(d) {
        console.log(d.Calories);
        return d.Calories;
    })]);
    var yScale = d3.scaleBand().rangeRound([0, height-50], 0.3).domain(csv.map(function(d) {
        return d.Item;
    }));

    var yAxis = d3.axisLeft(yScale);
    var xAxis = d3.axisTop(xScale);

    bars.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(200, 0)')
        .call(yAxis);

    bars
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(200," + (height - 50) + ")")
        .call(xAxis);

    bars
        .append("g")
        .selectAll(".bar")
        .data(csv)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("transform", "translate(180, 0)")
        .attr("x", 30)
        .attr("y", function (d) {
            return yScale(d.Item);
        })
        .attr("width", function (d) {
            // console.log(d.Calories);
            // console.log(xScale(d.Calories));
            return xScale(d.Calories);
            // return xScale(getValue(d));
        })
        .attr("height", function (d) {
            // console.log(yScale.bandwidth());
            return yScale.bandwidth() * 0.8;
        })
        .on('click', function(d) {
            console.log(d)
            generatePieChart(d)
        });

    d3.select("#button")
        .style("border", "1px solid black")
        .text('Filter Data')
        .on('click', function() {

            bars.selectAll('.bar')
                .filter(function(d) {
                    // this.style.opacity = "100";
                    // var selected = d.frequency >= d3.select("#cutOff").property("value");
                    // if (!selected) {
                    //     this.style.opacity = "0";
                    // }
                    // return selected;

                })
                .transition()
                .duration(function(d) {
                    return Math.random() * 1000;
                })
                .delay(function(d) {
                    return d.frequency;
                })
                .style('fill', getSelection)
                .attr('width', function(d) {
                    return xScale(d.frequency);
                });



            //change x-axis scale

        });

    //sorting



    function getValue(d) {

    }

    function getSelection() {
        return d3.select("#nutrientSelect").property("value");
    }

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
