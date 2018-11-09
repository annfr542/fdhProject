// load data
let data;
$.getJSON( "citiesData.json", function( json ) {
   data = json;
});

// create a graph
let graph;
$.getScript("graph.js", function() {
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

// computes the distance of the path
function path_dist(path)
{
    let dist = 0;
    for(i = 0; i < path.length-1; i++){
        let j = 0;
        let k = 0;
        while(path[i] != data[j].city){
            j++;
        }
        while(path[i+1] != data[j].connectionWith[k].city){
            k++;
        }
        dist = dist + data[j].connectionWith[k].dist;
    }
    return dist;
}

function printInput() {
    inputFrom = document.getElementById("InputFrom").value;
    inputTo = document.getElementById("InputTo").value;

    // find path
    let path = graph.findpath(inputFrom, inputTo);
    let dist = path_dist(path);

    document.getElementById("Print").innerHTML = "From " + inputFrom + " to " + inputTo;
    document.getElementById("path").innerHTML = printpath(path);
    document.getElementById("dist").innerHTML = dist;
}
    





