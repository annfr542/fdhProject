class Timetable { 
    constructor(){};
    
    createTimetable(path, depOrArr) 
    { 
        this.distance = this.path_dist(path);
        const cost = this.path_cost(path);
        const changes = countChanges(path);

        this.cost = {"first": cost[0], "second": cost[1], "third": cost[2]};
        this.schedule = [];

        // Calculate routes with time for different classes
        let inputDate = Fulldate();
        let t1 = schedules(path,inputDate, 1, depOrArr); //schedules 1st class
        let fo1 = fullobject(path, t1);
        let t = schedules(path,inputDate, 0, depOrArr); //schedules 2nd and 3rd classes
        let fo = fullobject(path, t);  

        if (fo1[0].dep.getTime() == fo[0].dep.getTime() && fo1[fo1.length-1].arr.getTime() == fo[fo.length-1].arr.getTime()){ // same for all classes
            const arrivalNextDay = arrNextDay(fo1[0].dep,fo1[fo1.length-1].arr)
            this.schedule.push({"changes": changes, "allowedClasses": 'All', "arrivalNextDay": arrivalNextDay, "fullTable": fo1})
        }
        else{
            const arrivalNextDay1 = arrNextDay(fo1[0].dep,fo1[fo1.length-1].arr)
            this.schedule.push({"changes": changes, "allowedClasses": 'First class only', "arrivalNextDay": arrivalNextDay1, "fullTable": fo1})

            const arrivalNextDay = arrNextDay(fo[0].dep,fo[fo.length-1].arr,)
            this.schedule.push({"changes": changes, "allowedClasses": 'All', "arrivalNextDay": arrivalNextDay, "fullTable": fo})
        }
    };

    path_dist(path){
        let dist = 0;
        for(i = 0; i < path.length-1; i++){
            dist = dist + graph.getDistance(path[i],path[i+1]);
        }
        return dist;
    }
    
    // computes the priceof the path for the three classes [p1, p2, p3]
    path_cost(path){
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
    let dates = [];
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct", "Nov", "Dec"];
    if(depart){
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
function countChanges(fullPath){
    count = 0;
    for (path of fullPath ){
        path.change == true? count = count + 1 : count = count;
    }
    return count;
}

function arrNextDay(dep, arr){
    if(dep.getHours() > arr.getHours()){
        return true;   
    }   
    return false;
}