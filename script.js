
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

let DepArrcheck = 1; //global variable for the depart/arrival box. 1 = dep, 0 = arr;

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

// computes the distance of the path
function path_dist(path){
    let dist = 0;
    for(i = 0; i < path.length-1; i++){
        dist = dist + graph.getDistance(path[i],path[i+1]);
    }
    return dist;
}

// computes the priceof the path for the three classes [p1, p2, p3]
function path_cost(path){

    let cost = [0, 0, 0];
    for(i = 0; i < path.length-1; i++){
        let cost_tmp;
        cost_tmp = graph.getCost(path[i],path[i+1]);
        for(j = 0; j < cost_tmp.length; j++){
            cost[j] = cost[j] + cost_tmp[j];
        }
    }
    return cost;
}

//choose the schedules
function schedules(path, inputDate, class1, depart){
    //all the dates stored in a vector [inputdate, dep1, arr1, dep2, arr2, dep3, ...]
    //inputdate removed at the end.

    let schedules = [];
    schedules.push(inputDate);
    for(j = 0; j < path.length-1; j++){
        let DepArr
        if(depart){
            DepArr = graph.getDepArr(path[j],path[j+1]); //{{dep, arr, exp}, {dep,arr,exp},...}
        } else{
            DepArr = graph.getDepArr(path[path.length-2-j],path[path.length-1-j]);
        }
       
        // remove all the express trains for classes 2 or 3
        if(class1 == false){
            let DepArr_tmp = [];
            for(k = 0; k < DepArr.length; k++){
                if(DepArr[k].express == "False"){
                    DepArr_tmp.push(DepArr[k]);
                }
            }
            DepArr = DepArr_tmp;    
        }
        
        // transform DepArr in schedules
        let sched = new Date();
        if(depart){
            sched = DepArrtoDate(DepArr, schedules[2*j], depart);
        } else{
            sched = DepArrtoDate(DepArr, schedules[0], depart);
        }
        
        let sameday= true;
        if(depart){
            while(sched[0].getTime() < schedules[2*j].getTime() && sameday){
                if(sched.length > 2){
                    sched.shift();
                    sched.shift();
                } else{
                    sameday = false;
                    sched[0].setDate(sched[0].getDate()+1);
                    sched = DepArrtoDate(DepArr, sched[0],depart);
                }
            }
            schedules.push(sched[0]);
            schedules.push(sched[1]);
        } else{
            while(sched[0].getTime() > schedules[0].getTime() && sameday){
                if(sched.length > 2){
                    sched.shift();
                    sched.shift();
                } else{
                    sameday = false;
                    sched[0].setDate(sched[0].getDate()-1);
                    sched = DepArrtoDate(DepArr, sched[0],depart);
                }
            }
            schedules.unshift(sched[0]);
            schedules.unshift(sched[1]);
        }
    }
    //remove inputdate
    if(depart){
        schedules.shift();
    } else{
        schedules.pop();
    }
    return schedules;
}

// transforms a set of DepArr to dates at the date of RefDate
function DepArrtoDate(DepArr, RefDate, depart){
    console.log("Refdate = " + RefDate);
    console.log("DepArr = " + DepArr);
    console.log("depart = " + depart);
    let dates = [];
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct", "Nov", "Dec"];
    if(depart){
        console.log("coucou");
        for(i=0; i<DepArr.length; i++){
            let newdateD = new Date(RefDate.getDate() + " " + months[RefDate.getMonth()]
            + " " + RefDate.getFullYear() + " " + DepArr[i].dep);
            dates.push(newdateD);
            let newdateA = new Date(RefDate.getDate() + " " + months[RefDate.getMonth()]
            + " " + RefDate.getFullYear() + " " + DepArr[i].arr);
            if(DepArr[i].dep > DepArr[i].arr){
                newdateA.setDate(newdateA.getDate()+1);
            }
            dates.push(newdateA);
        }
    } else {
        console.log("pas cocou");
        for(i=0; i<DepArr.length; i++){
            let newdateD = new Date(RefDate.getDate() + " " + months[RefDate.getMonth()]
            + " " + RefDate.getFullYear() + " " + DepArr[i].dep);
            dates.push(newdateD);
            let newdateA = new Date(RefDate.getDate() + " " + months[RefDate.getMonth()]
            + " " + RefDate.getFullYear() + " " + DepArr[i].arr);
            if(DepArr[i].dep > DepArr[i].arr){
                newdateD.setDate(newdateD.getDate()-1);
            }
        dates.push(newdateA);
        }
        dates.reverse();
    }
    
    return dates
}

//transform the schedules list in a array of objects {stop, bool change, dep date, arr date}
function fullobject(path, schedules){

    let fullschedules = [];

    for(i=0; i < path.length; i++){
        let change = false;
        let full;

        if(i == 0){
            full = {"city": path[i], "change": change, "arr": null, "dep": schedules[2*i]};
        } else if(i == path.length - 1){
            full = {"city": path[i], "change": change, "arr": schedules[2*i-1], "dep": null};
        } else{
            if(schedules[2*i-1].getTime() != schedules[2*i].getTime()){
                change = true;
            }
            full = {"city": path[i], "change": change, "arr": schedules[2*i-1], "dep": schedules[2*i]};
        }
        
        fullschedules.push(full);
    }

    return fullschedules;
}

// returns date that is today at the desired time
function Fulldate(){
    let today = new Date();
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct", "Nov", "Dec"];
    let newdate = new Date(today.getDate() + " " + months[today.getMonth()]
     + " " + today.getFullYear() + " " + document.getElementById("time").value);
    return newdate;
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
    let inputDate = Fulldate(); //TODO: get the date from input, (by default today)

    console.log(DepArrcheck);
    // find path, distance, schedules
    let path = graph.findpath(inputFrom, inputTo);
    let dist = path_dist(path);
    let cost = path_cost(path);
    let t1 = schedules(path,inputDate, 1, DepArrcheck); //schedules 1st class
    let fo1 = fullobject(path, t1);
    let t = schedules(path,inputDate, 0, DepArrcheck); //schedules 2nd and 3rd classes
    let fo = fullobject(path, t);
    console.log(fo);

    document.getElementById("fromto").innerHTML = inputFrom + " to " + inputTo;

    this.updateTimetable('10:00','12:00','2h','3');

    document.getElementById("result").style.visibility = "visible";

    document.getElementById("Print").innerHTML = "From " + inputFrom + " to " + inputTo;
    document.getElementById("path").innerHTML = printpath(path);
    document.getElementById("dist").innerHTML = dist;

    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct", "Nov", "Dec"];

    let str1 = [];
    for(i=0; i<=fo1.length-1; i++){
        let print = 1;
        if(i == 0){
            s1 = "1st class: Depart in " + fo1[i].city + " at " + DatetoHHmm(fo1[i].dep) + " on the " + fo1[i].dep.getDate() +
            " " + months[fo1[i].dep.getMonth()] + "\n";
        } else if(i == (fo1.length-1)){
            s1 = "Arrival in " + fo1[i].city + " at " + DatetoHHmm(fo1[i].arr) + " on the " + fo1[i].arr.getDate() +
            " " + months[fo1[i].arr.getMonth()] + ". Price is " + cost[0] + "\n";
        } else{
            if(fo1[i].change){
                s1 = "Change in " + fo1[i].city + ". Arrival at " + DatetoHHmm(fo1[i].arr) + " on the " + fo1[i].arr.getDate() +
                " " + months[fo1[i].arr.getMonth()] + " and Departure at " + DatetoHHmm(fo1[i].dep) + " on the " + fo1[i].dep.getDate() +
                " " + months[fo1[i].dep.getMonth()] + "\n";
            } else{
                print = 0;
            }
        }
        if(print){
            s1 = s1.split("\n").join("<br />");
            str1.push(s1);
        }
        
    }
    document.getElementById("printtime1").innerHTML = str1;

    let str = [];
    for(i=0; i<=fo.length-1; i++){
        let print = 1;
        if(i == 0){
            s2 = "2nd class: Depart in " + fo[i].city + " at " + DatetoHHmm(fo[i].dep) + " on the " + fo[i].dep.getDate() +
            " " + months[fo[i].dep.getMonth()] + "\n";
        } else if(i == (fo.length-1)){
            s2 = "Arrival in " + fo[i].city + " at " + DatetoHHmm(fo[i].arr) + " on the " + fo[i].arr.getDate() +
            " " + months[fo[i].arr.getMonth()] + ". Price is " + cost[1] + " and " + cost[2] + "\n";
        } else{
            if(fo[i].change){
                s2 = "Change in " + fo[i].city + ". Arrival at " + DatetoHHmm(fo[i].arr) + " on the " + fo[i].arr.getDate() +
                " " + months[fo[i].arr.getMonth()] + " and Departure at " + DatetoHHmm(fo[i].dep) + " on the " + fo[i].dep.getDate() +
                " " + months[fo[i].dep.getMonth()] + "\n";
            } else{
                print = 0;
            }
        }
        if(print){
            s2 = s2.split("\n").join("<br />");
            str.push(s2);
        }
    }
    document.getElementById("printtime").innerHTML = str;
}

function updateTimetable(dep,arr,travelTime,changes){
    // grab the old table
    const tableRef = document.getElementById('result').getElementsByTagName('tbody')[0];

    // create a new table
    let table = document.createElement('tbody');
    
    // replace the old table with the new one
    tableRef.parentNode.replaceChild(table, tableRef)

    // Insert a row in the table 
    let newRow   = table.insertRow(0);

    // Insert the cells 
    newRow.insertCell(0);
    newRow.insertCell(1).appendChild(document.createTextNode(dep));
    newRow.insertCell(2).appendChild(document.createTextNode(arr));
    newRow.insertCell(3).appendChild(document.createTextNode(travelTime));
    newRow.insertCell(4).appendChild(document.createTextNode(changes));

    const moreInfo = newRow.insertCell(5);
    moreInfo.className = "showmore";
    moreInfo.onclick = printMoreInfo(moreInfo,0);
    moreInfo.appendChild(document.createTextNode("+"));

    let moreInfoRow = table.insertRow(1);
    moreInfoRow.id = "moreInfoRow1";
    moreInfoRow.style.visibility = 'collapse';
    moreInfoRow.insertCell(0);
    moreInfoRow.insertCell(1).appendChild(document.createTextNode(dep));
    moreInfoRow.insertCell(2).appendChild(document.createTextNode(arr));
    moreInfoRow.insertCell(3).appendChild(document.createTextNode(travelTime));
    moreInfoRow.insertCell(4).appendChild(document.createTextNode(changes));


}

function printMoreInfo(moreInfo,id) {
    return function() {
        
        if (moreInfo.childNodes[0].nodeValue == '+' )
        {
            moreInfo.childNodes[0].replaceWith(document.createTextNode("-"))
            document.getElementById('moreInfoRow1').style.visibility = 'visible';
        }
        else
        {
            moreInfo.childNodes[0].replaceWith(document.createTextNode("+"))
            document.getElementById('moreInfoRow1').style.visibility = 'collapse';
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
    DepArrcheck = 0;
    ar.style.color = "black";
    dep.style.color = "gray";
  } else {
    DepArrcheck = 1;
    dep.style.color = "black";
    ar.style.color = "gray";
  }

}






