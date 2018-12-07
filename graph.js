// create a graph class 
class Graph { 
    // defining vertex array and 
    // adjacent list and
    // connections list with all edge information
    constructor(noOfVertices) 
    { 
        this.noOfVertices = noOfVertices; 
        this.AdjList = new Map(); 
        this.connections = new Map();
    } 
  
  
    addVertex(v) 
    { 
    // initialize the adjacent list with a 
    // null array 
    this.AdjList.set(v.toLowerCase(), []); 
    }  
    
    // add edge to the graph 
    addEdge(v, w) 
    { 

        // get the list for vertex v and put the 
        // vertex w denoting edge betweeen v and w 
        this.AdjList.get(v.toLowerCase()).push(w.city.toLowerCase()); 
                
        const connction = {"departures": w.departures, "cost": w.cost, "dist": w.dist};
        const key = v.toLowerCase() + w.city.toLowerCase();
        this.connections.set(key, connction);
    } 

    // Prints the vertex and adjacency list 
    printGraph() 
    { 
        // get all the vertices 
        const get_keys = this.AdjList.keys(); 
    
        // iterate over the vertices 
        for (let i of get_keys)  
    { 
            // great the corresponding adjacency list 
            // for the vertex 
            const get_values = this.AdjList.get(i); 
            let conc = ""; 
    
            // iterate over the adjacency list 
            // concatenate the values into a string 
            for (let j of get_values) 
                conc += j.city + " "; 
    
            // print the vertex and its adjacency list 
            //console.log(i + " -> " + conc); 
        } 
    }  
    
    // utility function for finding paths in graph 
    // from source to destination 
    findpath(src, dst) 
    { 
        if (!this.AdjList.get(src) || !this.AdjList.get(dst)){
            return null;
        }
        // create a visited array 
        let visited = []; 
        for (let i = 0; i < this.noOfVertices; i++) 
            visited[i] = false; 

        // create a queue which stores 
        // the paths 
        let q = [];  
    
        // path vector to store the current path 
        let path = [];
        path.push(src); 
        q.push(path); 

        visited[src] = true;

        while (q.length != 0) { 
            path = q.shift(); 
            const last = path[path.length-1];
    
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
                    const newPath = path.slice(); 
                    newPath.push(connectedNodes[i]); 
                    q.push(newPath); 

                    // mark node as visited
                    visited[connectedNodes[i]] = true;
                } 
            } 
        }
        return 0 
    } 

    // returns the cost of the trip between two cities for each class
    getCost(v,w){
        const key = v + w;
        return this.connections.get(key).cost
    }

    // calculate the distance between two cities
    getDistance(v,w){
        const key = v + w;
        return this.connections.get(key).dist;
    }

    // returns all the schedules for a given path
    getDepArr(v,w){
        const key = v + w;
        return this.connections.get(key).departures;
    }

    getSizedepartures(v,w,c1){
        const key = v + w;
        if(c1){
            return this.connections.get(key).departures.length;
        }
        else{
            let cnt = 0;
            for(i=0;i<this.connections.get(key).departures.length;i++){
                if(this.connections.get(key).departures[i].express == "False"){
                    cnt++;
                }
            }
            return cnt;
        }
    }
} 


