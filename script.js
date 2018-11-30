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

let timeTable = {};
$.getScript("timetable.js", function(){
    timeTable = new Timetable();
})
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
    const fullTable = schedule.fullTable;

    const dep = fullTable[0].dep;
    const arr = fullTable[fullTable.length - 1].arr;
    const travelTime = arr-dep;
    const changes = countChanges(fullTable);

    // Insert the cells for the main information
    newRow.insertCell(0);
    newRow.insertCell(1).appendChild(document.createTextNode(datetoHHmm(dep)));
    const arrival = schedule.arrivalNextDay ? datetoHHmm(arr) + " +1day" : datetoHHmm(arr);
    newRow.insertCell(2).appendChild(document.createTextNode(arrival));
    newRow.insertCell(3).appendChild(document.createTextNode(travelTime));
    newRow.insertCell(4).appendChild(document.createTextNode(changes));
    newRow.insertCell(5).appendChild(document.createTextNode(schedule.allowedClasses));

    const showMore = newRow.insertCell(6);
    showMore.className = "showmore";
    newRow.onclick = showMoreInfo(showMore,index);
    showMore.appendChild(document.createTextNode("+"));

    let moreInfoRow = table.insertRow(-1);
    moreInfoRow.className = "moreInfoRow" + index;
    //moreInfoRow.className = "moreInfo" + index;
    moreInfoRow.classList.add("moreInfo");
    moreInfoRow.style.visibility = 'collapse';
    moreInfoRow.insertCell(0);
    const header = moreInfoRow.insertCell(1)
    header.appendChild(document.createTextNode("All stops"));
    header.style.fontWeight = 'bold';
   
    printMoreInfo(schedule,table,index);
    
   
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


function printMoreInfo(schedule,table,index){
    fullTable = schedule.fullTable;
    const dep = {"city":fullTable[0].city, "departure": datetoHHmm(fullTable[0].dep)};
    const arr = {"city":fullTable[fullTable.length - 1].city, "arrival": datetoHHmm(fullTable[fullTable.length - 1].arr)};
    addMoreInfoRow(table,index,dep.city,dep.departure);
    fullTable.pop();
    fullTable.shift();
    for (row of fullTable) {
        if(row.change)
        {
            addMoreInfoRow(table,index, row.city, datetoHHmm(row.arr))
            addMoreInfoRow(table,index, "-")
            addMoreInfoRow(table,index, row.city, datetoHHmm(row.dep))
        }
        else{
            addMoreInfoRow(table,index,row.city,datetoHHmm(row.dep))
        }
    } 
    addMoreInfoRow(table,index,arr.city, arr.arrival);

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





