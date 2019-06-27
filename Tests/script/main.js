////////////////////////////////////////////////////////////////////////////////////
////////////////////////////      MAIN ALGORITHM      //////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

function main(input){    
    //Extract all possible data from board
    const extractedData = getData(input);
    // console.log('EXTRACT: ', extractedData);
    

    if(extractedData != 20052019){
        //Reconfigure modules
        const result = reconfigure(extractedData);
        // console.log('RESULT: ', result);
        return result.steps;
    }
    else{
        // console.log('Input and reconfiguration are the same');
        return [];
    }


}






/////////////////////////////////PREPROCESSING////////////////////////////7
//Cell structure
// {
//     type: module/empty

//     //MODULE STATS
//     movable: boolean
//     criticalPairs: [criticalPairID]
//     fixed: boolean
//     borders:{
        // N: {hole: int,
        //     prev: [i, j],
        //     next: [i, j]},
        // S: ...,
        // E: ...,
        // W: ... }

//     //EMPTY STATS
//     hole: holeID
// }

//Global variables
var configuration;
var visited;
var holesList;

//Utilities functions
function sameModule(mod1, mod2){
    return mod1[0] == mod2[0] && mod1[1] == mod2[1];
}

function modSurrounded(i, j){
    if(i == 0 || j == 0 || i == configuration.length-1 || j == configuration[0].length-1) return false;
    return configuration[i+1][j].type == 'module' && configuration[i-1][j].type == 'module' && configuration[i][j+1].type == 'module' && configuration[i][j-1].type == 'module';
}

function spacesBFS(map, iIni, jIni){
    visited[iIni][jIni] = 1;
    var toVisit = [[iIni, jIni]];

    //Start hole spaces list
    holesList.push({parent: null, childs: [], list: []});

    while(toVisit.length)
    {
        var iCurr = toVisit[0][0];
        var jCurr = toVisit[0][1];
        if(iCurr > 0 && jCurr > 0 && iCurr < map.length-1 && jCurr < map[0].length-1){//within the true map
            configuration[iCurr-1][jCurr-1].hole = holesList.length-1;
            holesList[holesList.length-1].list.push([iCurr-1, jCurr-1]);
        }

        if(iCurr > 0){
            if(!visited[iCurr-1][jCurr] && !map[iCurr-1][jCurr]){
                visited[iCurr-1][jCurr] = 1;
                toVisit.push([iCurr-1, jCurr]);
            }
        }
        if(jCurr > 0){
            if(!visited[iCurr][jCurr-1] && !map[iCurr][jCurr-1]){
                visited[iCurr][jCurr-1] = 1;
                toVisit.push([iCurr, jCurr-1]);
            }
        }
        if(iCurr < map.length-1){
            if(!visited[iCurr+1][jCurr] && !map[iCurr+1][jCurr]){
                visited[iCurr+1][jCurr] = 1;
                toVisit.push([iCurr+1, jCurr]);
            }
        }
        if(jCurr < map[0].length-1){
            if(!visited[iCurr][jCurr+1] && !map[iCurr][jCurr+1]){
                visited[iCurr][jCurr+1] = 1;
                toVisit.push([iCurr, jCurr+1]);
            }
        }

        toVisit.shift();
    }
}

function analyzeSteps(iIni, jIni, hole){
    //Pick up first module in list (TOP LEFT MODULE)
    // N = 0 // W = 1 // S = 2 // E = 3 //
    
    var to; //Direction to check next
    var borderChain = [];
    borderChain.push([iIni, jIni]);

    //Set-up
    var actualMod = borderChain[0];
    if(hole == 0) to = 2;
    else to = 3;
    var waitTurns = 2; //flag-up

    //Move along the boundary modules until all of them are seen
    while(waitTurns > 0 || !(sameModule(borderChain[borderChain.length-2], borderChain[0]) && sameModule(borderChain[borderChain.length-1], borderChain[1]))) //break when keyword found
    {

        if(waitTurns) --waitTurns; //flag-down

        var nextMod = null;
        //Find next module through directions in CCW order
        while(!nextMod)
            {
                //Define the action in the different directions
                if(to == 0 && actualMod[0] > 0) {
                    if(configuration[actualMod[0]-1][actualMod[1]].type == 'module') nextMod = [actualMod[0]-1, actualMod[1]];
                }
                else if(to == 1 && actualMod[1] > 0) {
                    if(configuration[actualMod[0]][actualMod[1]-1].type == 'module') nextMod = [actualMod[0], actualMod[1]-1];
                }
                else if(to == 2 && actualMod[0] < configuration.length-1) {
                    if(configuration[actualMod[0]+1][actualMod[1]].type == 'module') nextMod = [actualMod[0]+1, actualMod[1]];
                }
                else if(to == 3 && actualMod[1] < configuration[0].length-1){
                    if(configuration[actualMod[0]][actualMod[1]+1].type == 'module') nextMod = [actualMod[0], actualMod[1]+1];
                }

                if(!nextMod) to = (to+1)%4;
                else to = (to+3)%4;
            }

        borderChain.push(nextMod);
        actualMod = nextMod;
        nextMod = null;
    } 

    borderChain = borderChain.slice(0,borderChain.length-2); //We extract the STOP WORD for the correct analysis of the chain

    //ANALYZE STEP CHAIN/////////////////////////////////////////////////////
    var stepCount = new Array(configuration.length);
    for(let i = 0; i < configuration.length; i++)
    {
        stepCount[i] = new Array(configuration[0].length);
        stepCount[i] = stepCount[i].fill(0);
    }

    borderChain.map(mod=>{ ++stepCount[mod[0]][mod[1]]; return; });

    for(let i = 0; i < stepCount.length; ++i)
        for(let j = 0; j < stepCount[0].length; ++j)
        {
            if(stepCount[i][j] == 1 && configuration[i][j].movable == null){
                configuration[i][j].movable = true;
            }
            else if(stepCount[i][j] > 1){
                configuration[i][j].movable = false;
            }
        }
}

function getData(input){
    //Initialize configuration matrix
    holesList = new Array(0);
    configuration = new Array(input.length);
    for(let i = 0; i < input.length; i++)
    {
        configuration[i] = new Array(input[0].length);
        for(let j = 0; j < input[0].length; ++j) configuration[i][j] = {type: null, movable: null, criticalPairs: null, hole: null};
    }

    var modulesList = [];
    var spacesList = [];

    //CLASSIFY INTO MODULES & EMPTY//////////////////////////////////////////////////////////////
    for(let i = 0; i < input.length; ++i)
        for(let j = 0; j < input[0].length; ++j)
        {

            if(input[i][j] == 1){
                modulesList.push([i,j]);
                configuration[i][j].type = 'module';
                configuration[i][j].criticalPairs = [];
            }
            else if(input[i][j] == 2){
                modulesList.push([i,j]);
                configuration[i][j].type = 'module';
                configuration[i][j].criticalPairs = [];
                configuration[i][j].movable = false;
                configuration[i][j].fixed = true;
            }
            else{
                spacesList.push([i,j]);
                configuration[i][j].type = 'empty';
            }
        }


    //IF there's 2 modules or less, minimum box can't be bigger than 1 x 2 o 1 x 1
    //IF there's no empty spaces, the configuration is already melted
    if(modulesList.length > 2 && spacesList.length > 0) 
    {
        //STEP CHAIN //Walking inside the modules
        analyzeSteps(modulesList[0][0], modulesList[0][1], 0);

        //Find critical pairs
        var criticalPairs = [];
        for(let i = 0; i < input.length-1; ++i)
            for(let j = 0; j < input[0].length; ++j)
            {
                //UP diagonal
                if(j < input[0].length-1){
                    if((input[i][j] == 1 || input[i][j] == 2) && (input[i+1][j+1] == 1 || input[i+1][j+1] == 2) && input[i][j+1] == 0 && input[i+1][j] == 0){
                        configuration[i][j].criticalPairs.push(criticalPairs.length);
                        configuration[i+1][j+1].criticalPairs.push(criticalPairs.length);
                        criticalPairs.push([[i,j],[i+1,j+1]]);
                    }
                }
                //DOWN diagonal
                if(j > 0){
                    if((input[i][j] == 1 || input[i][j] == 2) && (input[i+1][j-1] == 1 || input[i+1][j-1] == 2) && input[i][j-1] == 0 && input[i+1][j] == 0){
                        configuration[i][j].criticalPairs.push(criticalPairs.length);
                        configuration[i+1][j-1].criticalPairs.push(criticalPairs.length);
                        criticalPairs.push([[i,j],[i+1,j-1]]);
                    }
                }
            }

        //ANALYZE GAPS AND EXTERIOR/////////////////////////////////////////////////
        //Using an extra periferical block to connect all the exterior spaces and know where to start

        //Prepare map
        var extraMap = input.map(row=>{return Object.assign([], row);});
        extraMap = extraMap.map(row=>{
            row.unshift(0);
            row.push(0);
            return row;
        });
        extraMap.unshift(new Array(extraMap[0].length));
        extraMap.push(new Array(extraMap[0].length));
        extraMap[0].fill(0);
        extraMap[extraMap.length-1].fill(0);

        //Prepare visited matrix
        visited = new Array(extraMap.length);
        for(let i = 0; i < visited.length; i++)
        {
            visited[i] = new Array(extraMap[0].length);
            visited[i] = visited[i].fill(0);
        }

        //Check unbounded with BFS
        spacesBFS(extraMap, 0, 0);

        //Check cells from holes
       
        for(var i = 0; i < spacesList.length; ++i){
            if(!visited[spacesList[i][0]+1][spacesList[i][1]+1]){
                spacesBFS(extraMap, spacesList[i][0]+1, spacesList[i][1]+1);
            }
        }

        //Create hierarchy of holes if there is through critical pairs
        var pairsVisited = new Array(criticalPairs.length);
        pairsVisited.fill(false);

        var lookFor = [0];
        while(lookFor.length > 0){ //Create Hierarchy from outside to inside
            var pairsToAnalyze = [];
            for(var i = 0; i < criticalPairs.length; ++i){
                if(!pairsVisited[i]){
                    if(criticalPairs[i][0][1] < criticalPairs[i][1][1]){ //DOWN diagonal
                        if(configuration[criticalPairs[i][0][0]][criticalPairs[i][0][1]+1].hole == lookFor[0]){
                            lookFor.push(configuration[criticalPairs[i][0][0]+1][criticalPairs[i][0][1]].hole);
                            holesList[lookFor[0]].childs.push({id: lookFor[lookFor.length-1], cp: i}); //Add child
                            holesList[lookFor[lookFor.length-1]].parent = {id: lookFor[0], cp: i};   //Design parent
                            pairsVisited[i] = true;
                        }
                        else if(configuration[criticalPairs[i][0][0]+1][criticalPairs[i][0][1]].hole == lookFor[0]){
                            lookFor.push(configuration[criticalPairs[i][0][0]][criticalPairs[i][0][1]+1].hole);
                            holesList[lookFor[0]].childs.push({id: lookFor[lookFor.length-1], cp: i}); //Add child
                            holesList[lookFor[lookFor.length-1]].parent = {id: lookFor[0], cp: i};   //Design parent
                            pairsVisited[i] = true;
                        }
                    }
                    else{ //UP diagonal
                        if(configuration[criticalPairs[i][0][0]][criticalPairs[i][0][1]-1].hole == lookFor[0]){
                            lookFor.push(configuration[criticalPairs[i][0][0]+1][criticalPairs[i][0][1]].hole);
                            holesList[lookFor[0]].childs.push({id: lookFor[lookFor.length-1], cp: i}); //Add child
                            holesList[lookFor[lookFor.length-1]].parent = {id: lookFor[0], cp: i};   //Design parent
                            pairsVisited[i] = true;
                        }
                        else if(configuration[criticalPairs[i][0][0]+1][criticalPairs[i][0][1]].hole == lookFor[0]){
                            lookFor.push(configuration[criticalPairs[i][0][0]][criticalPairs[i][0][1]-1].hole);
                            holesList[lookFor[0]].childs.push({id: lookFor[lookFor.length-1], cp: i}); //Add child
                            holesList[lookFor[lookFor.length-1]].parent = {id: lookFor[0], cp: i};   //Design parent
                            pairsVisited[i] = true;
                        }
                    }
                    
                }
            }

            lookFor.shift();
        }

        //Find inner boundaries of holes not in hierarchy
        //Connect remaining holes in critical pairs;
        for(var i = 0; i < criticalPairs.length; ++i){
            if(!pairsVisited[i]){
                var hole1, hole2;
                pairsVisited[i] = true;
                if(criticalPairs[i][0][1] < criticalPairs[i][1][1]){ //DOWN diagonal
                    hole1 = configuration[criticalPairs[i][0][0]][criticalPairs[i][0][1]+1].hole;
                    hole2 = configuration[criticalPairs[i][0][0]+1][criticalPairs[i][0][1]].hole;
                }
                else{ //UP diagonal
                    hole1 = configuration[criticalPairs[i][0][0]][criticalPairs[i][0][1]-1].hole;
                    hole2 = configuration[criticalPairs[i][0][0]+1][criticalPairs[i][0][1]].hole;
                }
                holesList[hole1].childs.push({id: hole2, cp: i}); //Add child
                holesList[hole2].childs.push({id: hole1, cp: i}); //Add child
            }
        }

        //Get boundaries of inner holes to find movable modules
        for(var i = 1; i < holesList.length; ++i){
            //STEP CHAIN //Walking inside the modules of holes not in hierarchy
            if(holesList[i].parent == null) analyzeSteps(holesList[i].list[0][0]-1, holesList[i].list[0][1], i);
        }

        //State movables and non-movables remaining
        for(var i = 0; i < modulesList.length; i++){
            var iCurr, jCurr;
            iCurr = modulesList[i][0];
            jCurr = modulesList[i][1];
            if(configuration[iCurr][jCurr].movable){
                if(modSurrounded(iCurr, jCurr)) //if mod surrounded then non movable
                    configuration[iCurr][jCurr].movable = false;
            }
            else if(configuration[iCurr][jCurr].movable == null){
                configuration[iCurr][jCurr].movable = false;
            }
        }

        var mods = { movables: [], nonMovables: [] };
        //Group movable and non-movable
        for(let i = 0; i < modulesList.length; ++i){
            if(configuration[modulesList[i][0]][modulesList[i][1]].movable) mods.movables.push(modulesList[i]);
            else mods.nonMovables.push(modulesList[i]);
        }

        var printMap = new Array(configuration.length);
        for(let i = 0; i < configuration.length; i++)
            printMap[i] = new Array(configuration[0].length);

        for(var i = 0; i < configuration.length; ++i)
            for(var j = 0; j < configuration[0].length; ++j){
                if(configuration[i][j].type == 'module'){
                    if(configuration[i][j].movable) printMap[i][j] = 'O';
                    else printMap[i][j] = 'X';
                }
                else printMap[i][j] = configuration[i][j].hole.toString();
            }

        return {configuration: configuration, holes: holesList, modules: mods, criticalPairs: criticalPairs};
    }
    else return 20052019;
}













////////////////////////////////////////RECONFIGURATION///////////////////////////////////////////////
// var preprocessing = require('./preprocessing');

var holes;
var mods;
var critPairs;

var steps;

function reconfigure(confData){
    configuration = confData.configuration;
    holes = confData.holes;
    mods = confData.modules;
    critPairs = confData.criticalPairs;
    steps = new Array(0);

    //FIRST ROW////////////////////////////////////////
    var completeFR = firstRow();
    // console.log('FIRST ROW:\n', completeFR);

    //Decide on which is the next possible space to cover
    //Check the LEFT MOST space of the configuration.

    var fullReconf = fillRest();

    // console.log('Reconfiguration done');
    return fullReconf;
}

function deleteArrayCell(e, arr){ //Designed for cell elements like [i,j]
    for(let i = 0; i < arr.length; ++i)
        if(arr[i][0] == e[0] && arr[i][1] == e[1]) //DELETE
            arr = arr.slice(0,i).concat(arr.slice(i+1));
    return arr;
}

function deleteArrayElement(e, arr){ //Designed for single elements
    for(let i = 0; i < arr.length; ++i)
        if(arr[i] == e) //DELETE
            arr = arr.slice(0,i).concat(arr.slice(i+1));
    return arr;
}

function surroundedBySpace(i, j){
    if(i > 0 && configuration[i-1][j].type == 'module') return false;
    else if(j > 0 && configuration[i][j-1].type == 'module') return false;
    else if(i < configuration.length-1 && configuration[i+1][j].type == 'module') return false;
    else if(j < configuration[0].length-1 && configuration[i][j+1].type == 'module') return false;
    return true;
}

function reachable(i, j, hole){
    var reach = false;
    if(i > 0) reach = reach || configuration[i-1][j].hole == hole;
    if(j > 0) reach = reach || configuration[i][j-1].hole == hole;
    if(i < configuration.length-1) reach = reach || configuration[i+1][j].hole == hole;
    if(j < configuration[0].length-1) reach = reach || configuration[i][j+1].hole == hole;
    return reach;
}

function confSwap(i1, j1, i2, j2){
    var aux = configuration[i1][j1];
    configuration[i1][j1] = configuration[i2][j2];
    configuration[i2][j2] = aux;
}

function cellCloseGap(cp, hole){
    if(critPairs[cp][0][1] < critPairs[cp][1][1]){ //DOWN diagonal
        if(configuration[critPairs[cp][0][0]][critPairs[cp][0][1]+1].hole == hole)
            return [critPairs[cp][0][0], critPairs[cp][0][1]+1];
        else if(configuration[critPairs[cp][0][0]+1][critPairs[cp][0][1]].hole == hole)
            return [critPairs[cp][0][0]+1, critPairs[cp][0][1]];
    }
    else{ //UP diagonal
        if(configuration[critPairs[cp][0][0]][critPairs[cp][0][1]-1].hole == hole)
            return [critPairs[cp][0][0], critPairs[cp][0][1]-1];
        else if(configuration[critPairs[cp][0][0]+1][critPairs[cp][0][1]].hole == hole)
            return [critPairs[cp][0][0]+1, critPairs[cp][0][1]];
    }
}

function findStep(iCell, jCell){
    while(configuration[iCell][jCell].type != 'module'){
        for(var i = 0; i < mods.movables.length; ++i){
            var modI = mods.movables[i][0];
            var modJ = mods.movables[i][1];
            if(reachable(modI, modJ, configuration[iCell][jCell].hole)){
                steps.push({from: [modI, modJ], to: [iCell, jCell]});  //Save step
                confSwap(modI, modJ, iCell, jCell);                    //Swap cells
                break;
            }
        }
        if(configuration[iCell][jCell].type != 'module'){ //No module reaches the point need more movable modules
            //APPARENTLY, when no mods reach the space the space always belongs to a hole in the hierarchy
            //AND we will always try to close first the above holes 
            var holeToReach = configuration[iCell][jCell].hole;
            var passWay = null;
            var startHole = holeToReach;
            var moveMade = false;
            var holesSeen = new Array(holesList.length);
            holesSeen.fill(false);
            holesSeen[holeToReach] = true;
            var holesToVisit = [];
            if(holesList[holeToReach].parent != null) holesToVisit.push(holesList[holeToReach].parent);
            //FIRST ABOVE
            while(holesToVisit.length && !moveMade){
                passWay = holesToVisit[0].cp; //Critical pair between both holes
                holeToReach = holesToVisit[0].id; //Hole above
                
                for(var i = 0; i < mods.movables.length; ++i){
                    var modI = mods.movables[i][0];
                    var modJ = mods.movables[i][1];
                    if(reachable(modI, modJ, holeToReach)){
                        var cellToClose = cellCloseGap(passWay, holeToReach);  //Find cell to close the gap
                        steps.push({from: [modI, modJ], to: [cellToClose[0], cellToClose[1]]});  //Save step
                        confSwap(modI, modJ, cellToClose[0], cellToClose[1]);                    //Swap cells
                        moveMade = true;
                        break;
                    }
                }
                if(!moveMade){
                    holesSeen[holeToReach] = true;
                    if(holesList[holeToReach].parent && !holesSeen[holesList[holeToReach].parent.id]) holesToVisit.push(holesList[holeToReach].parent);
                    holesList[holeToReach].childs.map(hole=>{
                        if(!holesSeen[hole.id]) holesToVisit.push(hole);
                    });
                    holesToVisit.shift();
                }
                //MISSING SPREADING
            }

            //SECOND BELOW (BFS)
            if(!moveMade){
                
                holesToVisit = holesToVisit.concat(holes[startHole].childs);
                while(holesToVisit.length && !moveMade){
                    passWay = holesToVisit[0].cp; //Critical pair between both holes
                    holeToReach = holesToVisit[0].id; //Hole below
                    
                    for(var i = 0; i < mods.movables.length; ++i){
                        var modI = mods.movables[i][0];
                        var modJ = mods.movables[i][1];
                        if(reachable(modI, modJ, holeToReach)){
                            var cellToClose = cellCloseGap(passWay, holeToReach);  //Find cell to close the gap
                            steps.push({from: [modI, modJ], to: [cellToClose[0], cellToClose[1]]});  //Save step
                            confSwap(modI, modJ, cellToClose[0], cellToClose[1]);                    //Swap cells
                            moveMade = true;
                            break;
                        }
                    }
                    if(!moveMade){
                        holesToVisit = holesToVisit.concat(holes[holeToReach].childs);
                        holesToVisit.shift();
                    }
                }
            }
            var newMap = createMap();
            // var newData = preprocessing.getData(newMap);
            var newData = getData(newMap);
            configuration = newData.configuration;
            holes = newData.holes;
            mods = newData.modules;
            critPairs = newData.criticalPairs;
        }
    }
    //Fix cell
    configuration[iCell][jCell].fixed = true;

    var newMap = createMap();
    // var newData = preprocessing.getData(newMap);
    var newData = getData(newMap);
    configuration = newData.configuration;
    holes = newData.holes;
    mods = newData.modules;
    critPairs = newData.criticalPairs;
}

function createMap(){
    var newMap = new Array(configuration.length);
    for(var i = 0; i < newMap.length; ++i){
        newMap[i] = new Array(configuration[0].length);
        for(var j = 0; j < newMap[0].length; ++j){
            if(configuration[i][j].fixed) newMap[i][j] = 2;
            else if(configuration[i][j].type == 'module') newMap[i][j] = 1;
            else newMap[i][j] = 0;
        }
    }

    return newMap;
}

function movableToNon(iMod, jMod){
    configuration[iMod][jMod].movable = false;
    for(let i = 0; i < mods.movables.length; ++i){
        if(sameModule(mods.movables[i], [iMod, jMod])){
            mods.movables = mods.movables.slice(0, i).concat(mods.movables.slice(i+1));
            break;
        }
    }
    mods.nonMovables.push([iMod, jMod]);
}

function firstRow(){

    //Arrange only the first bottom row as a goal
    // var goalsMap = new Array(configuration[0].length);
    // goalsMap.fill(true);

    var firstPos = 0;
    var fPFound = false;
    while(!fPFound){
        if(configuration[configuration.length-1][firstPos].type == 'module'){
            fPFound = true;
            configuration[configuration.length-1][firstPos].fixed = true;
            if(configuration[configuration.length-1][firstPos].movable){//remove first fixed module from movables
                movableToNon(configuration.length-1, firstPos);                
            }
        }
        else ++firstPos;
    }

    //First fill to the left
    for(var i = firstPos-1; i >= 0; --i){
        //See if any movable mod can reach the position
        if(configuration[configuration.length-1][i].type != 'module'){
            findStep(configuration.length-1, i);
        }
        else{
            if(configuration[configuration.length-1][i].movable)
                movableToNon(configuration.length-1, i);
        }

        configuration[configuration.length-1][i].fixed = true;    
    }

    //Second to the right
    for(var i = firstPos+1; i < configuration[0].length; ++i){
        if(configuration[configuration.length-1][i].type != 'module'){
            findStep(configuration.length-1, i);
        }
        else{
            if(configuration[configuration.length-1][i].movable)
                movableToNon(configuration.length-1, i);
        }

        configuration[configuration.length-1][i].fixed = true;    
    }

    //RETURN SOMETHING
    var finalMap = createMap();
    return{map: finalMap, steps: steps};

}

function fillRest(){
    //Compute 
    var totalMods = mods.movables.length + mods.nonMovables.length;
    var completeRows = Math.floor(totalMods/configuration[0].length);
    var lastRowMods = totalMods - (completeRows*configuration[0].length);
    var lastRow = configuration.length-1 - completeRows;

    //Full rows
    for(var i = configuration.length-2; i > lastRow; --i)
        for(var j = 0; j < configuration[0].length; ++j){
            if(configuration[i][j].type != 'module'){
                findStep(i, j);
            }
            else{
                if(configuration[i][j].movable)
                    movableToNon(i, j);
            }

            configuration[i][j].fixed = true;    
        }

    //Last row
    for(var j = 0; j < lastRowMods; ++j){
        if(configuration[lastRow][j].type != 'module'){
            findStep(lastRow, j);
        }
        else{
            if(configuration[i][j].movable)
                movableToNon(i, j);
        }

        configuration[lastRow][j].fixed = true;    
    }

    //RETURN SOMETHING
    var finalMap = createMap();
    return{map: finalMap, steps: steps};
}

// module.exports = {
//     main
// };