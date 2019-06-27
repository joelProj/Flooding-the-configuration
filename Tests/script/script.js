// const tests = require('./tests');
// const algorithm = require('./main');

var tags = ['DENS', 'HIERARCHY', 'HOLES', 'MEDIUM', 'MINIM', 'NESTED'];

// function script(){
//     for(let i = 0; i < 6; ++i){
//         for(let j = 0; j < 5; ++j){
//             // var steps = algorithm.main(tests[i][j]);
//             var totalTime = 0;
//             var steps;
//             for(let k = 0; k < 3; ++k){
//                 var startTime = new Date().getTime();
//                 steps = main(tests[i][j]);
//                 var finishTime = new Date().getTime();
//                 totalTime += (finishTime - startTime)/1000;
//             }
//             totalTime = totalTime/3;

//             //Expand matrix
//             for(let k = 0; k < tests[i][j].length; ++k){
//                 tests[i][j][k].unshift(0);
//                 tests[i][j][k].push(0);
//             }
//             tests[i][j].unshift(new Array(tests[i][j][0].length));
//             tests[i][j].push(new Array(tests[i][j][0].length));
//             tests[i][j][0].fill(0);
//             tests[i][j][tests[i][j].length-1].fill(0);

//             var nSteps = 0;
//             for(let k = 0; k < steps.length; ++k){
//                 var path = findPath(steps[k], tests[i][j]);
//                 nSteps += path.length-1;
//                 tests[i][j][steps[k].from[0]+1][steps[k].from[1]+1] = 0;
//                 tests[i][j][steps[k].to[0]+1][steps[k].to[1]+1] = 1;
//             }
//             console.log(tags[i]+' '+ j +': ' + totalTime + ', ' + nSteps);
//         }
//     }
// }


// function script(){
//   for(let i = 0; i < 6; ++i){
//       console.log(tags[i]+ ':');
//     for(let j = 0; j < 5; ++j){
//       var modCounter = 0;
//       tests[i][j].map(row=>{
//         row.map(cell=>{
//           if(cell == 1) ++modCounter;
//         });
//       });
//       console.log(modCounter);
//     }
//   }
// }
function script(){
  var diameter = 145;
  var stopCount = 10000;
  var numMods = 0;
  var spiralMat = new Array(diameter);
  for(let i = 0; i <diameter; ++i){
    spiralMat[i] = new Array(diameter);
    spiralMat[i].fill(0);
  }

  var curr = [Math.floor(diameter/2), Math.floor(diameter/2)];
  spiralMat[curr[0]][curr[1]] = 1;
  var level = 1;
  var dir = 3;
  while(numMods < stopCount){
    for(let j = 0; j < level; ++j){
      if(dir == 0){
        --curr[0];
      }
      else if(dir == 1){
        --curr[1];
      }
      else if(dir == 2){
        ++curr[0];
      }
      else if(dir == 3){
        ++curr[1];
      }
      spiralMat[curr[0]][curr[1]] = 1;
      ++numMods;
    }
    ++level;
    dir = (dir+3)%4;
  }

  var str = JSON.stringify(spiralMat);
  str = str.replace(/],/g, '],\n');
  console.log(str);

}

function findPath(step, matrix){ //inverted true if prev button
  var moduleCell = Object.assign([], step.from);
  ++moduleCell[0];
  ++moduleCell[1];
  var gapCell = Object.assign([], step.to);
  ++gapCell[0];
  ++gapCell[1];

  var paths = [];
  for(let i = 0; i < 4; ++i){ //FIND all initial cells and paths
    if(i == 0 && moduleCell[0] > 0 && !matrix[moduleCell[0]-1][moduleCell[1]]) paths.push({path: [moduleCell, [moduleCell[0]-1, moduleCell[1]]], dir: (i+1)%4});
    if(i == 1 && moduleCell[1] > 0 && !matrix[moduleCell[0]][moduleCell[1]-1]) paths.push({path: [moduleCell, [moduleCell[0], moduleCell[1]-1]], dir: (i+1)%4});
    if(i == 2 && moduleCell[0] < matrix.length-1 && !matrix[moduleCell[0]+1][moduleCell[1]]) paths.push({path: [moduleCell, [moduleCell[0]+1, moduleCell[1]]], dir: (i+1)%4});
    if(i == 3 && moduleCell[1] < matrix[0].length-1 && !matrix[moduleCell[0]][moduleCell[1]+1]) paths.push({path: [moduleCell, [moduleCell[0], moduleCell[1]+1]], dir: (i+1)%4});
  }

  //Check if path if of 1 movement
  for(let i = 0; i < paths.length; ++i){
    var lastCell = paths[i].path[paths[i].path.length-1];
    if(lastCell[0] == gapCell[0] && lastCell[1] == gapCell[1]) return paths[i].path;
  }

  //BFS by the left for each path
  var found = -1;
  
  while(found == -1){
    for(let i = 0; i < paths.length; ++i){
      var nextCell = null;
      var actualMod = paths[i].path[paths[i].path.length-1];
      //Find next module through directions in CCW order
      for(let j = 0; j < 4; ++j)
      {
        //Define the action in the different directions
        if(paths[i].dir == 0 && actualMod[0] > 0) {
          if(!matrix[actualMod[0]-1][actualMod[1]]) nextCell = [actualMod[0]-1, actualMod[1]];
        }
        else if(paths[i].dir == 1 && actualMod[1] > 0) {
          if(!matrix[actualMod[0]][actualMod[1]-1]) nextCell = [actualMod[0], actualMod[1]-1];
        }
        else if(paths[i].dir == 2 && actualMod[0] < matrix.length-1) {
          if(!matrix[actualMod[0]+1][actualMod[1]]) nextCell = [actualMod[0]+1, actualMod[1]];
        }
        else if(paths[i].dir == 3 && actualMod[1] < matrix[0].length-1){
          if(!matrix[actualMod[0]][actualMod[1]+1]) nextCell = [actualMod[0], actualMod[1]+1];
        }

        if(!nextCell) paths[i].dir = (paths[i].dir+3)%4;
        else{
          paths[i].dir = (paths[i].dir+1)%4;
          break;
        }
      }

      if(nextCell){
        paths[i].path.push(nextCell);
        actualMod = nextCell;
        if(nextCell[0] == gapCell[0] && nextCell[1] == gapCell[1]){
          found = i;
          break;
        }
        nextCell = null;
      }
    }
  }

  return paths[found].path;
}