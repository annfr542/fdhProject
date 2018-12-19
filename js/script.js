// create a graph
let graph;
let Cities = [];
let timeTable = {};
$.getScript("js/timetable.js", function(){
    timeTable = new Timetable();
})

$.getJSON( "data/citiesData.json", function( data ) {
    $.getScript("js/graph.js", function() {
        graph = new Graph(data.length);
        // Add all nodes
        for (i = 0; i < data.length; i++) { 
            Cities.push(data[i].city);
            graph.addVertex(data[i].city);
        }

        // Add all edges
        for (i = 0; i < data.length; i++) {
            for (j = 0; j < data[i].connectionWith.length; j++){
                graph.addEdge(data[i].city,data[i].connectionWith[j]);
            }
        }
    });
});

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

whenDocumentLoaded(() => {
	// Initialize time
    let today = new Date()
    today.getDate();
    document.getElementById('time').value = datetoHHmm(today);
});

let depOrArr = 1; //global variable for the depart/arrival box. 1 = dep, 0 = arr;
let inputFrom = "";
let inputTo = "";
let inputime = "";


function arrival(){
    // Get the checkbox
        const checkBox = document.getElementById("switch");
        // Get the output text
        const dep = document.getElementById("dep");
        const ar = document.getElementById("ar");
    
        // If the checkbox is checked, display the output text
        if (checkBox.checked == true){
            depOrArr = 0;
            ar.style.color = "black";
            dep.style.color = "gray";
        } else {
            depOrArr = 1;
            dep.style.color = "black";
            ar.style.color = "gray";
        }
    
}

function printResult() {

     /* 
     // Evaluate the accuracy of graph
     $.getJSON("controlData.json", testElements => {
        tester(testElements,graph);
        });
    */

    inputFrom = document.getElementById("InputFrom").value.toLowerCase();
    inputTo = document.getElementById("InputTo").value.toLowerCase();
    // find path, distance, schedules
    let path = graph.findpath(inputFrom, inputTo);

    if(!path){
        document.getElementById("errorMessage").style.visibility = "visible"; 
        document.getElementById("result").style.visibility = "hidden"; 
        document.getElementById("error").innerHTML = "Couldn't find a route between " + firstToUpper(inputFrom) 
        + " and " + firstToUpper(inputTo);
        return;
    }

    document.getElementById("fromto").innerHTML = firstToUpper(inputFrom) + " to " + firstToUpper(inputTo);
    
    timeTable.createTimetable(path,depOrArr);
    updateTimetable(timeTable);
    document.getElementById("result").style.visibility = "visible"; 
    document.getElementById("errorMessage").style.visibility = "hidden";      
}

function updateTimetable(timeTable){
    // grab the old table
    const tableRef = document.getElementById('result').getElementsByTagName('tbody')[0];

    // create a new table
    let table = document.createElement('tbody');
    
    // replace the old table with the new one
    tableRef.parentNode.replaceChild(table, tableRef)

    for (i in timeTable.schedule)
    {
        addEntryToTimetable(timeTable.schedule[i],timeTable.cost,timeTable.distance,table,i);
    }

}

function addEntryToTimetable(schedule,costs,dist,table,index){
    // Insert a row in the table 
    let newRow   = table.insertRow(-1);
    const fullTable = schedule.fullTable;

    const dep = fullTable[0].dep;
    const arr = fullTable[fullTable.length - 1].arr;
    const travelTime = hoursFromMiliseconds(arr-dep);
    const changes = countChanges(fullTable);

    // Insert the cells for the main information
    newRow.insertCell(0);
    newRow.insertCell(1).appendChild(document.createTextNode(datetoHHmm(dep)));
    const arrival = schedule.nrOfDays < 1 ? datetoHHmm(arr) : schedule.nrOfDays > 1 ? datetoHHmm(arr) + " +" + schedule.nrOfDays +" days" : datetoHHmm(arr) + " +" + schedule.nrOfDays +" day";
    newRow.insertCell(2).appendChild(document.createTextNode(arrival));
    newRow.insertCell(3).appendChild(document.createTextNode(travelTime));
    newRow.insertCell(4).appendChild(document.createTextNode(changes));
    const classes = schedule.firstClassOnly ? "First class only" : "All";
    newRow.insertCell(5).appendChild(document.createTextNode(classes));

    const showMore = newRow.insertCell(6);
    showMore.className = "showmore";
    newRow.onclick = showMoreInfo(showMore,index);
    showMore.appendChild(document.createTextNode("+"));

    // Add more info header
    let moreInfoRow = table.insertRow(-1);
    moreInfoRow.className = "moreInfoRow" + index;
    moreInfoRow.classList.add("moreInfo");
    moreInfoRow.style.visibility = 'collapse';
    moreInfoRow.insertCell(0);

    // add header for all stops
    const allStops = moreInfoRow.insertCell(1)
    allStops.appendChild(document.createTextNode("All stops"));
    allStops.style.fontWeight = 'bold';

    // Add prices 
    printPrices(costs,schedule.firstClassOnly,moreInfoRow);
    
    // Add distance
    const distCell = moreInfoRow.insertCell(-1)
    distCell.appendChild(document.createTextNode("Distance: " + dist + " km"));
    distCell.style.fontSize ='0.9rem';
    distCell.colSpan = '2';


    // Add rest of more info
    printFullTimetable(schedule,table,index);
}

function showMoreInfo(moreInfo,index) {
    return function() {
        let info = document.getElementsByClassName('moreInfoRow' + index);
        if (moreInfo.childNodes[0].nodeValue == '+' )
        {
            moreInfo.childNodes[0].replaceWith(document.createTextNode("-"))
            Array.from(info).forEach(element => {
                element.style.visibility = 'visible';
            }); 
        }
        else
        {
            moreInfo.childNodes[0].replaceWith(document.createTextNode("+"))
            Array.from(info).forEach(element => {
                element.style.visibility = 'collapse';
            });
        }
    };
}

function printPrices(costs,firstClassOnly,moreInfoRow){
    const classes = ["1st", "2nd", "3d"];

    // create a new cell and append label
    const priceCell = moreInfoRow.insertCell(-1)
    priceCell.appendChild(document.createTextNode("Price "));


    // create drop down list
    let prices = document.createElement("select");

    if(firstClassOnly){
        let option = document.createElement("option");
            option.value = costs[0];
            option.text = classes[0] +" " + costs[0].toFixed(1) + " fr.";
            prices.appendChild(option);
    }else{
        //Create and append the options
        for (i  in costs) {
            let option = document.createElement("option");
            option.value = costs[i];
            option.text = classes[i] + " " + costs[i].toFixed(1) + " fr.";
            prices.appendChild(option);
        }
    }
    // append drop down list to price cell
    priceCell.appendChild(prices);
}


function printFullTimetable(schedule,table,index){
    fullTable = schedule.fullTable;
    const dep = {"city":fullTable[0].city, "departure": datetoHHmm(fullTable[0].dep)};
    const arr = {"city":fullTable[fullTable.length - 1].city, "arrival": datetoHHmm(fullTable[fullTable.length - 1].arr)};
    addMoreInfoRow(table,index,firstToUpper(dep.city),dep.departure);
    fullTable.pop();
    fullTable.shift();
    for (row of fullTable) {
        if(row.change)
        {
            addMoreInfoRow(table,index, firstToUpper(row.city), datetoHHmm(row.arr))
            addMoreInfoRow(table,index, "-")
            addMoreInfoRow(table,index, firstToUpper(row.city), datetoHHmm(row.dep))
        }
        else{
            addMoreInfoRow(table,index,firstToUpper(row.city),datetoHHmm(row.dep))
        }
    } 
    addMoreInfoRow(table,index,firstToUpper(arr.city), arr.arrival);

}

function addMoreInfoRow(table,index,city,time = ""){
    let moreInfoRow = table.insertRow(-1);
    moreInfoRow.className = "moreInfoRow" + index;
    //moreInfoRow.className = "moreInfo" + index;
    moreInfoRow.classList.add("moreInfo");
    moreInfoRow.style.visibility = 'collapse';
    moreInfoRow.insertCell(0);
    let textCell = moreInfoRow.insertCell(1);
    textCell.appendChild(document.createTextNode(time + " " + city));
    textCell.style.padding = '0 0 0 10px';
    textCell.style.fontStyle = 'italic';
    textCell.style.fontSize = '0.8rem';
}

// Help functions
// to print only the time HH:mm from a date
function datetoHHmm(date){

    let h = date.getHours();
    if(h<10){
        h = "0"+h;
    }
    let m = date.getMinutes();
    if(m<10){
        m = "0"+m;
    }
    time = h + ":" + m;
    return time;
}

function hoursFromMiliseconds(time){
    const minInMili = time % (1000*60*60);
    const min = minInMili / (1000*60);
    const hour = (time - minInMili )/ (1000*60*60);
    return hour + "h " + min +"m";
}

$( function() {
    $( "#InputFrom" ).autocomplete({
      source: Cities
    });
    $( "#InputTo" ).autocomplete({
        source: Cities
      });
});

function firstToUpper(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/* Automatic test function: "testData" is an array of correct value, "graph" is the used graph
test[0] = from
test[1] = to
test[2] = Price first class
test[3] = Price second class
test[4] = Price third class
test[5] = distance
 */
function tester(testData, graph){
    let distTest = [];
    let class1Test = [];
    let class2Test = [];
    let class3Test = [];

    for (test of testData){
        let path = graph.findpath(test[0], test[1]);
        if(path){
            timeTable.createTimetable(path,true);

            distTest.push(Math.abs(timeTable.distance - test[5])<= 1);
            class1Test.push(Math.abs(timeTable.cost[0] -test[2]) <= 1);
            class2Test.push(Math.abs(timeTable.cost[1] - test[3]) <= 1);
            class3Test.push(Math.abs(timeTable.cost[2] - test[4]) <= 1);
        }
    }

    function add(a, b) {
        return a + b;
    }
    
    console.log("Distance accuracy: " + distTest.reduce(add, 0)/distTest.length);
    console.log("Price class 1 accuracy: " + class1Test.reduce(add, 0)/class1Test.length);
    console.log("Price class 2 accuracy: " + class2Test.reduce(add, 0)/class2Test.length);
    console.log("Price class 3 accuracy: " + class3Test.reduce(add, 0)/class3Test.length);
}




