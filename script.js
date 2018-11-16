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
function path_dist(path)
{
    let dist = 0;
    for(i = 0; i < path.length-1; i++){
        const next = i + 1;
        dist = dist + graph.getDistance(path[i],path[i+1]);
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
    





