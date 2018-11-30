// create a graph
let graph;
$.getJSON( "citiesData.json", function( data ) {
    $.getScript("graph.js", function() {
        graph = new Graph(data.length);
        // Add all nodes
        for (i = 0; i < data.length; i++) { 
            graph.addVertex(data[i].city);
        }

        // Add all edges
        for (i = 0; i < data.length; i++) {
            for (j = 0; j < data[i].connectionWith.length; j++){
                graph.addEdge(data[i].city,data[i].connectionWith[j]);
            }
        }
        graph.printGraph();
    });
});

// Initialize timetable and inputs
let timeTable = {};
$.getScript("timetable.js", function(){
    timeTable = new Timetable();
})
let depOrArr = 1; //global variable for the depart/arrival box. 1 = dep, 0 = arr;
let inputFrom = "";
let inputTo = "";
let inputTime = "";

function printpath(path) 
{ 
    let pathString = "";
    for (i = 0; i < path.length; i++) {
        pathString = pathString + " " + path[i];
    } 
    return pathString;
} 

// to print only the time HH:mm from a date
function DatetoHHmm(date){

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

function printInput() {
    inputFrom = document.getElementById("InputFrom").value;
    inputTo = document.getElementById("InputTo").value;
    // find path, distance, schedules
    let path = graph.findpath(inputFrom, inputTo);
    
    
    timeTable.createTimetable(path,depOrArr);
    updateTimetable(timeTable);

    document.getElementById("fromto").innerHTML = inputFrom + " to " + inputTo;
    document.getElementById("result").style.visibility = "visible";      
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
        addEntryToTimetable(timeTable.schedule[i],timeTable.cost,timeTable.dist,table,i);
    }

   
   
}

function addEntryToTimetable(schedule,cost,dist,table,index){
    // Insert a row in the table 
    let newRow   = table.insertRow(-1);

    const dep = schedule.fullTable[0].dep;
    const arr = schedule.fullTable[schedule.fullTable.length - 1].arr;
    const travelTime = arr-dep;
    const changes = countChanges(schedule.fullTable);

    // Insert the cells for the main information
    newRow.insertCell(0);
    newRow.insertCell(1).appendChild(document.createTextNode(this.DatetoHHmm(dep)));
    newRow.insertCell(2).appendChild(document.createTextNode(this.DatetoHHmm(arr)));
    newRow.insertCell(3).appendChild(document.createTextNode(travelTime));
    newRow.insertCell(4).appendChild(document.createTextNode(changes));
    newRow.insertCell(5).appendChild(document.createTextNode(schedule.allowedClasses));

    const showMore = newRow.insertCell(6);
    showMore.className = "showmore";
    showMore.onclick = printMoreInfo(showMore,index);
    showMore.appendChild(document.createTextNode("+"));

    let moreInfoRow = table.insertRow(-1);
    moreInfoRow.id = "moreInfoRow" + index;
    moreInfoRow.style.visibility = 'collapse';
    moreInfoRow.insertCell(0);
    moreInfoRow.insertCell(1).appendChild(document.createTextNode(dep));
    moreInfoRow.insertCell(2).appendChild(document.createTextNode(arr));
    moreInfoRow.insertCell(3).appendChild(document.createTextNode(travelTime));
    moreInfoRow.insertCell(4).appendChild(document.createTextNode(changes));
}

function printMoreInfo(moreInfo,index) {
    return function() {
        
        if (moreInfo.childNodes[0].nodeValue == '+' )
        {
            moreInfo.childNodes[0].replaceWith(document.createTextNode("-"))
            document.getElementById('moreInfoRow' + index).style.visibility = 'visible';
        }
        else
        {
            moreInfo.childNodes[0].replaceWith(document.createTextNode("+"))
            document.getElementById('moreInfoRow' + index).style.visibility = 'collapse';
        }
    };
}


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






