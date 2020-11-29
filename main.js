let width = 1500;
let height = 800;
const radius = 200;
const calories = [9, 4, 0, 4];        // # calories each macronutrient provides
const CARB_GREEN = '#2E603A', FAT_YELLOW = '#CB9947', PROTEIN_BLUE = '#186A8D';
const pieChartColors = d3.scaleOrdinal([FAT_YELLOW, CARB_GREEN, 'crimson', PROTEIN_BLUE])   // fat, carb, fiber, protein (fiber should never show up)
const MIN = 'min';
const MAX = 'max';
const STROKE_MULT = 1.5;
const UNHIGLIGHT_OPACITY = 0.6;
let curStrokeWidth = 1;

d3.csv("starbucksfoods.csv", function (csv) {


    //margin values to format PCP within div
    let margin = { top: 30, right: 10, bottom: 10, left: -250 },
        width = 1500 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;


    //PCP graph
    let graph = d3.select("#pcp").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    //get the 5 axes values (Calories, Fat, Carb, Fiber Protein)
    let dimensions = d3.keys(csv[0]).filter(function (d) {
        return (d != "Item" && d != "Category");
    });


    //for each dimension, build a linear scale and store in y
    let y = {};
    for (i in dimensions) {
        let dimName = dimensions[i];
        y[dimName] = d3.scaleLinear()
            .domain(d3.extent(csv, function (d) { return +d[dimName]; }))
            .range([height, 0])
    }


    //build "x" scale by distributing the y-axes in equal intervals across width
    let x = d3.scalePoint()
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
    let color = d3.scaleOrdinal()
        .domain(["Bagels", "Bars", "Bowls", "Breakfasts", "Cake Pops", "Cookies", "Croissants", "Desserts",
            "Muffins & Breads", "Protein Boxes", "Scones", "Salads", "Sandwiches", "Snacks", "Yogurts"])
        .range(["#000000", "#090979", "#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087", "#f95d6a", "#ff7c43", "#ffa600",
            "#bf940b", "#787f18", "#005c2d", "#002f17", "#006b65"]);


    //highlights hovered lines/paths
    let highlight = function (d) {
        //select the line being hovered and change styling
        d3.select(this)
            .transition().duration(200)
            //color is chosen according to mapping above ****NOTE too many colors?
            .style("stroke", color(d.Category))
            .style("stroke-width", Math.max(4, STROKE_MULT * curStrokeWidth))
            .style("opacity", "1");
        // create pie chart if hover is checked
        let createPie = d3.select('#createPie').property("checked");
        if (createPie) { generatePieChart(d) };
    };


    //un-highlights lines/paths and returns all to default
    let unHighlight = function (d) {
        d3.selectAll(".lines")
            .transition().duration(200).delay(200)
            .style("stroke", "#00704A")
            .style("stroke-width", curStrokeWidth)
            .style("opacity", UNHIGLIGHT_OPACITY);
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
        .style("opacity", UNHIGLIGHT_OPACITY)
        .on('click', function (d) {
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
    // d3.select("#button")
    //     .style("border", "1px solid black")
    //     .text('Filter Data')
    //     //only displays the lines for the selected category
    //     .on('click', applyFilters);

    // filters data when selection changes (no need to click 'Apply Filters' button)
    d3.select("#categorySelect")
        .on('change', applyFilters);


    // --- PIE INITIALIZATION (start) ---

    // set up pie chart variables so generatePieChart function updates these
    let pieWidth = 400;
    let pieHeight = 400;
    let pieChart = d3.select("#pieChart")
        .append("svg")
        .attr("width", pieWidth)
        .attr("height", pieHeight);
    let g = pieChart.append("g").attr("transform", "translate(" + pieWidth / 2 + "," + pieHeight / 2 + ")");

    // Generate the pie
    let pie = d3.pie();

    // Generate the arcs
    let arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    // --- pie initialization (end) ---
    resetSliders()
    // function to create the pie chart of the % make-up of calories per macronutrient
    function generatePieChart(data) {

        // Add text for the item
        d3.select('#item').text(data.Item + ' - (' + data.Category + ')');

        d3.select('#totalCalories').text(data.Calories);

        let dataSet = [data.Fat, data.Carb, data.Fiber, data.Protein]

        // calculate # of calories each macronutrient contributes in total
        let calorieSet = dataSet.map((elem, i) => calories[i] * elem)

        // finds % contribution to calories from each macronutrient
        let calorieSum = sumCalories(calorieSet);
        let percentage = calorieSet.map((e) => Math.round((e / calorieSum) * 100));

        // delete previous arcs (elements w/ class 'arc')
        pieChart.selectAll(".arc").remove();

        //Generate groups
        let arcs = g.selectAll("arc")       // g.slice or arc ?
            .data(pie(calorieSet))
            .enter()
            .append("g")
            .attr("class", "arc");

        //Draw arc paths
        arcs.append("path")
            .attr("fill", function (d, i) {
                return pieChartColors(i);
            })
            .attr("d", arc)
            // controls color/width of spaces around slices
            .attr("stroke", "white")
            .style("stroke-width", "2px")

        // draw label
        arcs.append("text")
            .attr("transform", function (d) {
                // dont know if necessary
                // d.innerRadius = 0;
                // d.outerRadius = 5;
                return "translate(" + arc.centroid(d) + ")";
            })
            .attr("text-anchor", "middle")
            .text(function (d, i) {
                if (!d.data) return;
                // hacky workaround
                let nutrients = ['Fat', 'Carb', 'Fiber', 'Protein'];
                return nutrients[i] + ': ' + percentage[i] + '%';
            }
            );

    } // generatePieChart

    // --- SLIDERS ---

    initSliders()
    // reset slider min/max button reset
    d3.select("#resetSliders")
        .style("border", "3px solid crimson")
        .on('click', function () {
            resetSliders();
            applyFilters();
        });

    // --- sliders (end) ---

});

function sumCalories(calSet, totalCal = 'N/A') {
    // uncomment log to check if calories calculated = total calories listed
    // calorie calculation for some items are off +/- 10 calories
    let sum = calSet.reduce(function (a, b) {
        return a + b;
    }, 0);
    // console.log('SUM: ' + sum + ' | total calories: ' + totalCal);
    return sum;
}

/**
 * Applies filters by selecting all lines in the PCP
 * that pass each filter condition
 * ex: filter conditions: isSelected, isBelowMax, isAboveMin
 */
function applyFilters() {

    // gets the value of category selection
    let selectValue = d3.select("#categorySelect").property("value");

    // get lines belonging to selected category + slider filters
    let passFilter = d3.selectAll('.lines')
        .filter(function (d) {
            // checks if item belongs to selected category
            let isSelected = d.Category == selectValue;
            // if selection is all, everything counts as selected
            if (selectValue == 'All' || selectValue == null || selectValue == '') { isSelected = true };
            // checks if any of items values lie below slider value
            let isBelowMax = checkIfBelowMax(d);
            let isAboveMin = checkIfAboveMin(d);
            // returns true if element passes all filters
            return isSelected && isBelowMax && isAboveMin;
        });
    // get lines not belonging to selected category + slider filters
    // reverse of selected
    let failFilter = d3.selectAll('.lines')
        .filter(function (d) {
            let isSelected = d.Category == selectValue;
            if (selectValue == 'All' || selectValue == null || selectValue == '') { isSelected = true };
            let isBelowMax = checkIfBelowMax(d);
            let isAboveMin = checkIfAboveMin(d);
            // returns false for elements that pass filters and true for elements that do not pass filters
            return !(isSelected && isBelowMax && isAboveMin);
        });

    // set stroke width based on num of visible lines
    let numLines = passFilter._groups[0].length;
    curStrokeWidth = getStrokeWidth(numLines);
    // make elements that pass/fail the filter visible/hidden
    passFilter
        .attr('visibility', 'visible')
        .style("stroke-width", curStrokeWidth);
    failFilter
        .attr('visibility', 'hidden');

} // applyFilters()


/**
 * Checks if an item has all its property values below
 * the max of the slider value for those properties
 * @param {some item w/ Calories, Fat, Category, etc} d 
 */
function checkIfBelowMax(d) {
    // gets the current value (to use as max filter) of the sliders
    let calorieMax = d3.select('#caloriesMax').property('value');
    let fatMax = d3.select('#fatMax').property('value');
    let carbMax = d3.select('#carbMax').property('value');
    let fiberMax = d3.select('#fiberMax').property('value');
    let proteinMax = d3.select('#proteinMax').property('value');
    let isBelowMax = (+d.Calories <= +calorieMax
        && +d.Fat <= +fatMax
        && +d.Carb <= +carbMax
        && +d.Fiber <= +fiberMax
        && +d.Protein <= +proteinMax);
    return isBelowMax;
}

/**
 * Checks if an item has all its property values above
 * the min of the slider value for those properties
 * @param {some item w/ Calories, Fat, Category, etc} d 
 */
function checkIfAboveMin(d) {
    // gets the current value (to use as min filter) of the sliders
    let calorieMin = d3.select('#caloriesMin').property('value');
    let fatMin = d3.select('#fatMin').property('value');
    let carbMin = d3.select('#carbMin').property('value');
    let fiberMin = d3.select('#fiberMin').property('value');
    let proteinMin = d3.select('#proteinMin').property('value');
    let isAboveMin = (+d.Calories >= +calorieMin
        && +d.Fat >= +fatMin
        && +d.Carb >= +carbMin
        && +d.Fiber >= +fiberMin
        && +d.Protein >= +proteinMin);
    return isAboveMin;
}

/**
 * Initializes sliders so value and label change when sliding
 * also calls apply filters whenever value changes
 */
function initSliders() {

    /**
     * Trying to select all slider inputs + labels 
     * to set up value + label change in one go
     * to reduce large chunk of code below
     * Not sure how to do this
     */

    // let minSlidersLabel = d3.select('#minSliders')
    //     .selectAll('label');
    // let minSliders = d3.select('#minSliders')
    //     .selectAll('input', function () {
    //         applyFilters();
    //         minSlidersLabel.text(+this.value);
    //         minSliders.property('value', +this.value);
    //     });

    // max sliders
    d3.select("#caloriesMax").on("input", function () {
        applyFilters();
        // adjust the text on the range slider
        d3.select("#caloriesMax-value").text(+this.value);
        d3.select("#caloriesMax").property("value", +this.value);
    });
    d3.select("#fatMax").on("input", function () {
        applyFilters();
        d3.select("#fatMax-value").text(+this.value);
        d3.select("#fatMax").property("value", +this.value);
    });
    d3.select("#carbMax").on("input", function () {
        applyFilters();
        d3.select("#carbMax-value").text(+this.value);
        d3.select("#carbMax").property("value", +this.value);
    });
    d3.select("#fiberMax").on("input", function () {
        applyFilters();
        // adjust the text on the range slider
        d3.select("#fiberMax-value").text(+this.value);
        d3.select("#fiberMax").property("value", +this.value);
    });
    d3.select("#proteinMax").on("input", function () {
        applyFilters();
        d3.select("#proteinMax-value").text(+this.value);
        d3.select("#proteinMax").property("value", +this.value);
    });

    // min sliders
    d3.select("#caloriesMin").on("input", function () {
        applyFilters();
        // adjust the text on the range slider
        d3.select("#caloriesMin-value").text(+this.value);
        d3.select("#caloriesMin").property("value", +this.value);
    });
    d3.select("#fatMin").on("input", function () {
        applyFilters();
        d3.select("#fatMin-value").text(+this.value);
        d3.select("#fatMin").property("value", +this.value);
    });
    d3.select("#carbMin").on("input", function () {
        applyFilters();
        d3.select("#carbMin-value").text(+this.value);
        d3.select("#carbMin").property("value", +this.value);
    });
    d3.select("#fiberMin").on("input", function () {
        applyFilters();
        // adjust the text on the range slider
        d3.select("#fiberMin-value").text(+this.value);
        d3.select("#fiberMin").property("value", +this.value);
    });
    d3.select("#proteinMin").on("input", function () {
        applyFilters();
        d3.select("#proteinMin-value").text(+this.value);
        d3.select("#proteinMin").property("value", +this.value);
    });
    
} // initSliders

/**
 * Resets sliders
 * max + min values currently hardcoded
 */
function resetSliders() {
    // max sliders
    d3.select('#caloriesMax').property('value', 650);
    d3.select('#fatMax').property('value', 40);
    d3.select('#carbMax').property('value', 80);
    d3.select('#fiberMax').property('value', 25);
    d3.select('#proteinMax').property('value', 35);
    // max text 
    d3.select('#caloriesMax-value').text('650');
    d3.select('#fatMax-value').text('40');
    d3.select('#carbMax-value').text('80');
    d3.select('#fiberMax-value').text('25');
    d3.select('#proteinMax-value').text('35');
    // min sliders
    d3.select('#caloriesMin').property('value', 0);
    d3.select('#fatMin').property('value', 0);
    d3.select('#carbMin').property('value', 0);
    d3.select('#fiberMin').property('value', 0);
    d3.select('#proteinMin').property('value', 0);
    // min text
    d3.select('#caloriesMin-value').text('0');
    d3.select('#fatMin-value').text('0');
    d3.select('#carbMin-value').text('0');
    d3.select('#fiberMin-value').text('0');
    d3.select('#proteinMin-value').text('0');
}

function getStrokeWidth(numLines) {
    return ((-0.3226 * numLines) + 46.5) / 10;
}