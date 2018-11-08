

// create a graph class 
class Graph { 
    // defining vertex array and 
    // adjacent list 
    constructor(noOfVertices) 
    { 
        this.noOfVertices = noOfVertices; 
        this.AdjList = new Map(); 
    } 
  
  
    addVertex(v) 
    { 
    // initialize the adjacent list with a 
    // null array 
    this.AdjList.set(v, []); 
    }  
    
    // add edge to the graph 
    addEdge(v, w) 
    { 
        // get the list for vertex v and put the 
        // vertex w denoting edge betweeen v and w 
        this.AdjList.get(v).push(w); 
    } 

    // Prints the vertex and adjacency list 
    printGraph() 
    { 
        // get all the vertices 
        var get_keys = this.AdjList.keys(); 
    
        // iterate over the vertices 
        for (var i of get_keys)  
    { 
            // great the corresponding adjacency list 
            // for the vertex 
            var get_values = this.AdjList.get(i); 
            var conc = ""; 
    
            // iterate over the adjacency list 
            // concatenate the values into a string 
            for (var j of get_values) 
                conc += j + " "; 
    
            // print the vertex and its adjacency list 
            console.log(i + " -> " + conc); 
        } 
    }  
  
    // function to performs BFS 
    bfs(startingNode) 
    { 
    
        // create a visited array 
        var visited = []; 
        for (var i = 0; i < this.noOfVertices; i++) 
            visited[i] = false; 
    
        // Create an object for queue 
        var q = []; 
    
        // add the starting node to the queue 
        visited[startingNode] = true; 
        q.push(startingNode); 
    
        // loop until queue is element 
        while (!q.isEmpty()) { 
            // get the element from the queue 
            var getQueueElement = q.dequeue(); 
    
            // passing the current vertex to callback funtion 
            console.log(getQueueElement); 
    
            // get the adjacent list for current vertex 
            var get_List = this.AdjList.get(getQueueElement); 
    
            // loop through the list and add the elemnet to the 
            // queue if it is not processed yet 
            for (var i in get_List) { 
                var neigh = get_List[i]; 
    
                if (!visited[neigh]) { 
                    visited[neigh] = true; 
                    q.enqueue(neigh); 
                } 
            } 
        } 
    }  
    
    // utility function for finding paths in graph 
    // from source to destination 
    findpath(src, dst) 
    { 
        // create a visited array 
        var visited = []; 
        for (var i = 0; i < this.noOfVertices; i++) 
            visited[i] = false; 

        // create a queue which stores 
        // the paths 
        var q = []; 
                    // queue<vector<int> > q; 
    
        // path vector to store the current path 
        // vector<int> path; 
        var path = [];
        path.push(src); 
        q.push(path); 

        visited[src] = true;

        while (q.length != 0) { 
            path = q.shift(); 
            const last = path[path.length - 1]; 
    
            // if last vertex is the desired destination 
            // then print the path 
            if (last == dst){
                return path;
            }  
                        
            // traverse to all the nodes connected to  
            // current vertex and push new path to queue 
            const connectedNodes = this.AdjList.get(last);

            for (i = 0; i < connectedNodes.length; i++) { 
                if (!visited[connectedNodes[i]]) { 
                    const newPath = path; 
                    newPath.push(connectedNodes[i]); 
                    q.push(newPath); 

                    // mark node as visited
                    visited[connectedNodes[i]] = true;
                } 
            } 
        }
        return 0 
    } 


    // dfs(v) 
} 


