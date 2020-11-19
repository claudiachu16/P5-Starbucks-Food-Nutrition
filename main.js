d3.csv("starbucksfoods.csv", function (csv) {
}




function generatePieChart(data) {

    var color = d3.scaleOrdinal(['#4daf4a','#377eb8','#ff7f00', '#984ea3'])
    dataSet = [data.Fat, data.Carb, data.Fiber, data.Protein]
    calories = [9, 4, 0, 4]
    // Set the calroies
    calorieSet = dataSet * calories
    pieChart = d3.select("#pieChart")
    // Generate the pie
    var pie = d3.pie();

    // Generate the arcs
    var arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius);

    //Generate groups
    var arcs = g.selectAll("arc")
                .data(pie(data))
                .enter()
                .append("g")
                .attr("class", "arc")

    //Draw arc paths
    arcs.append("path")
        .attr("fill", function(d, i) {
            return color(i);
        })
        .attr("d", arc);
}