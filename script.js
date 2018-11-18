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


// make sure we can use the graph library

let inputFrom = "";
let inputTo = "";

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

// choose the schedules
function schedules(path, time){
   min = HHMMtoMM(time);
   console.log(min);
   return min
}

// from hours and minutes to minutes
function HHMMtoMM(time){
    var min, tsplit;
    tsplit = time.split(":");
    min = parseint(tsplit[0])*60 + parseint(tsplit[1]);
    return min;
}



function printInput() {
    inputFrom = document.getElementById("InputFrom").value;
    inputTo = document.getElementById("InputTo").value;
    time = document.getElementById("time").value;
    console.log(time);
    // find path
    let path = graph.findpath(inputFrom, inputTo);
    let dist = path_dist(path);
    let t = schedules(path,time);


    document.getElementById("Print").innerHTML = "From " + inputFrom + " to " + inputTo;
    document.getElementById("path").innerHTML = printpath(path);
    document.getElementById("dist").innerHTML = dist;
    document.getElementById("printtime").innerHTML = "Departure at " + t + ", arrival at " + t;
}

function arrival(){
// Get the checkbox
  const checkBox = document.getElementById("switch");
  // Get the output text
  const dep = document.getElementById("dep");
  const ar = document.getElementById("ar");

  // If the checkbox is checked, display the output text
  if (checkBox.checked == true){
    ar.style.color = "black";
    dep.style.color = "gray";
  } else {
    dep.style.color = "black";
    ar.style.color = "gray";
  }

}

// function chooseName(){
//     var input, filter, ul, li, a, i;
//     input = document.getElementById("inputFrom");
//     filter = input.value.toUpperCase();
//     ul= document.getElementById("myUL");
//     li = ul.getElementsByTagName("li");
//     for (i = 0; i < li.length;i++){
//         a = li[i].getElementsByTagName("a")[0];
//         if (a.innerHTML.toUpperCase().indexOf(filter) > -1){
//             li[i].style.display = "";
//         } else {
//             li[i].style.display = "none";
//         }
//     }

    // function chooseName2(){
    //     var cities = [
    //         'Paris',
    //         'Maçon',
    //         'Bourg',
    //         'Pont-d\'Ain',
    //     ];

    //     var input = document.getElementById("inputFrom");
        
    //     var list = document.createElement("ul");
	//     list.className = "suggestions";
	//     list.style.display = "none";

	//     form.appendChild(list);
    // }
    //}  




