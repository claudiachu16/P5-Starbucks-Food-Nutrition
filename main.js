var width = 1500;
var height = 800;
const radius = 200
const calories = [9, 4, 0, 4];        // # calories each macronutrient provides
const pieChartColors = d3.scaleOrdinal(['gold', 'blueviolet', 'green', 'darksalmon'])   // fat, carb, fiber, protein

d3.csv("starbucksfoods.csv", function (csv) {


    //margin values to format PCP within div
    var margin = { top: 30, right: 10, bottom: 10, left: 0 },
        width = 1500 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;


    //PCP graph
    var graph = d3.select("#pcp").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    //get the 5 axes values (Calories, Fat, Carb, Fiber Protein)
    var dimensions = d3.keys(csv[0]).filter(function (d) {
        return (d != "Item" && d != "Category");
    });


    //for each dimension, build a linear scale and store in y
    var y = {};
    for (i in dimensions) {
        var dimName = dimensions[i];
        y[dimName] = d3.scaleLinear()
            .domain(d3.extent(csv, function (d) { return +d[dimName]; }))
            .range([height, 0])
    }


    //build "x" scale by distributing the y-axes in equal intervals across width
    var x = d3.scalePoint()
        .range([0, width])
        .padding(1)
        .domain(dimensions);


    //a function that takes in a row of csv/a starbucks item and returns the (x,y) coordinates of line to draw
    function path(d) {
        return d3.line()(dimensions.map(function (p) {
            return [x(p), y[p](d[p])];
        }));
    }


    //color mappings for each of the categories
    var color = d3.scaleOrdinal()
        .domain(["Bagels", "Bars", "Bowls", "Breakfasts", "Cake Pops", "Cookies", "Croissants", "Desserts",
            "Muffins & Breads", "Protein Boxes", "Scones", "Salads", "Sandwiches", "Snacks", "Yogurts"])
        .range(["#000000", "#090979", "#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087", "#f95d6a", "#ff7c43", "#ffa600",
            "#bf940b", "#787f18", "#005c2d", "#002f17", "#006b65"]);


    //highlights hovered lines/paths
    var highlight = function (d) {
        //select the line being hovered and change styling
        d3.select(this)
            .transition().duration(200)
            //color is chosen according to mapping above ****NOTE too many colors?
            .style("stroke", color(d.Category))
            .style("stroke-width", 4)
            .style("opacity", "1");
    };


    //un-highlights lines/paths and returns all to default
    var unHighlight = function (d) {
        d3.selectAll(".lines")
            .transition().duration(200).delay(200)
            .style("stroke", "#00704A")
            .style("stroke-width", 1)
            .style("opacity", 0.6);
    };


    //draws the lines onto the PCP graph
    graph
        .selectAll("myPaths")
        .data(csv)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "lines")
        .style("fill", "none")
        //color them all the same ***NOTE too many colors (15 for 15 categories)
        .style("stroke", "#00704A")
        .style("opacity", 0.6)
        .on('click', function (d) {
            console.log('click line: d');
            console.log(d);         // the food item {item, calories, etc}
            generatePieChart(d);
        })
        .on("mouseover", highlight)
        .on("mouseout", unHighlight);


    //draw the axes
    graph.selectAll("myAxes")
        .data(dimensions).enter()
        //each axis is in its own group
        .append("g")
        //translate the axis to its correct position along the width
        .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
        .each(function (d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        .attr("class", "axis")
        //axis title and styling
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function (d) { return d; })
        .style("stroke", "black");


    //'Filter Data' button and its functionalities
    d3.select("#button")
        .style("border", "1px solid black")
        .text('Filter Data')
        //only displays the lines for the selected category
        .on('click', function () {
            //name of selected category
            // console.log('FILTER CLICKED: ' + d3.select("#categorySelect").property("value"));

            var selectValue = d3.select("#categorySelect").property("value");

            // show all lines
            if (selectValue == 'All' || selectValue == null || selectValue == '') {
                console.log('ALL SELECTED');
                d3.selectAll('.lines')
                    .transition().duration(200)
                    .attr('visibility', 'visible');
                return;
            }

            // get lines beloning to selected category
            var selected = d3.selectAll('.lines')
                .filter(function (d) {
                    // console.log(d);
                    return d.Category == selectValue;
                });
            // get lines not belonging to selected category
            var notSelected = d3.selectAll('.lines')
                .filter(function (d) {
                    // console.log(d);
                    return d.Category != selectValue;
                });
            // make selected / notSelected visible / not visible
            selected
                .transition().duration(200)
                .attr('visibility', 'visible');
            notSelected
                .transition().duration(200)
                .attr('visibility', 'hidden');
        });


    // --- PIE INITIALIZATION (start) ---

    // set up pie chart variables so generatePieChart function updates these
    var pieChart = d3.select("#pieChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    var g = pieChart.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Generate the pie
    var pie = d3.pie();

    // Generate the arcs
    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    // shape helper to build arcs:
    var arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)

    // --- pie initialization (end) ---

    // function to create the pie chart of the % make-up of calories per macronutrient
    function generatePieChart(data) {


        console.log(data);

        var dataSet = [data.Fat, data.Carb, data.Fiber, data.Protein]

        // calculate # of calories each macronutrient contributes in total
        var calorieSet = dataSet.map((elem, i) => calories[i] * elem)

        // logCheckCalories(calorieSet, data.Calories);


        // delete previous arcs (elements w/ class 'arc')
        pieChart.selectAll(".arc").remove();

        //Generate groups
        var arcs = g.selectAll("arc")
            .data(pie(calorieSet))
            .enter()
            .append("g")
            .attr("class", "arc");

        //Draw arc paths
        arcs.append("path")
            .attr("fill", function (d, i) {
                console.log('COLOR')
                return pieChartColors(i);
            })
            .attr("d", arc)
            // controls color/width of spaces around slices
            .attr("stroke", "white")
            .style("stroke-width", "2px")


    } // generatePieChart

});

function logCheckCalories(calSet, totalCal) {
    // logging function, unecessary for functionality
    // just checking if calories calculated = total calories listed
    var sum = calSet.reduce(function (a, b) {
        return a + b;
    }, 0);
    console.log('SUM: ' + sum + ' | total calories: ' + totalCal);
}
