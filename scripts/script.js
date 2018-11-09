// load data
let data;
$.getJSON( "citiesData.json", function( json ) {
   data = json;
});

// create a graph
let graph;
$.getScript("./scripts/graph.js", function() {
    graph = new Graph(data.length);
    // Add all nodes
    for (i = 0; i < data.length; i++) { 
        graph.addVertex(data[i].city);
    }

    // Add all edges
    for (i = 0; i < data.length; i++) {
        for (j = 0; j < data[i].connectionWith.length; j++){
            graph.addEdge(data[i].city,data[i].connectionWith[j].city);
        }
    }
    graph.printGraph();
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

function printInput() {
    inputFrom = document.getElementById("InputFrom").value;
    inputTo = document.getElementById("InputTo").value;

    // find path
    let path = graph.findpath(inputFrom, inputTo)

    document.getElementById("Print").innerHTML = "From " + inputFrom + " to " + inputTo;
    document.getElementById("path").innerHTML = printpath(path);
}



    





