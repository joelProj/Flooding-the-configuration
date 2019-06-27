//MISSING STUFF

//Values & data structures
var n = 10;
var m = 10;
var matrix;
var initialConfiguration;
var reconfSteps;
var stage = 0;
var totalStages = 0;
var actualPath = [];
var computationTime = 0;
var nSteps = 0;
var nModules = 0;
var uploadedFile = null;

//Style attributes
var leftOffset = 30;
var rightOffset = 0;
var topOffset = 0;
var bottomOffset = 0;
var squareSize = 20;

//FLAGS
var display = false;
var paint = true;

//HTML GENERAL COMPONENTS
var title;
var titleInitWidth;
var cnvs;
var downloadButton;
var fileInput;
var nModulesP;

//INSTRUCTIONS COMPONENTS
var subtitle;
var step1;
var step2;
var step3;
var step4;
var featuresTitle;
var downloadUploadP;
var moveXStepsP;
var playAndStop;
var simulatorButton;

//HTML INPUT COMPONENTS
var redrawButton;
var clearButton;
var reconfigureButton;
var rowsP;
var inputN;
var columnsP;
var inputM;
var incorrectP;
var paintButton;
var instructionsButton;

//HTML DISPLAY COMPONENTS
var backButton;
var previousStepButton;
var nextStepButton;

//User Interface Build Up
function setup() {
  init();

  //Hide display components
  backButton.hide();
  previousStepButton.hide();
  stepP.hide();
  nextStepButton.hide();
  timeStepsP.hide();

  title.position(leftOffset, 0);
  cnvs.position(title.x, title.y + title.height*2);
  subtitle.position(leftOffset, title.y + title.height*2+10);
  step1.position(leftOffset, subtitle.y + subtitle.height*2+10);
  step2.position(leftOffset, step1.y + step1.height+10);
  step3.position(leftOffset, step2.y + step2.height+10);
  step4.position(leftOffset, step3.y + step3.height+10);
  featuresTitle.position(leftOffset, step4.y + step4.height+10);
  downloadUploadP.position(leftOffset, featuresTitle.y + featuresTitle.height*2+10);
  moveXStepsP.position(leftOffset, downloadUploadP.y + downloadUploadP.height+10);
  playAndStop.position(leftOffset, moveXStepsP.y + moveXStepsP.height+10);
  simulatorButton.position(leftOffset, playAndStop.y + playAndStop.height+10);

  switchView(0);
}

function init(){
  //Instructions view
  title = createElement('h1', 'Reconfiguring lattice square-shaped modular robots in-place by sliding');
  subtitle = createElement('h2', 'Simulator Instructions');
  step1 = createP(`<b>1.</b> Draw the reconfiguration in the grid by clicking on the cells or dragging the mouse over the grid while pressed.<br>
  Doing click once, will paint the cell blue symbolizing it is now a moudle. To change it back just click onn it again.<br>
  If you need a larger grid, you can modify the numbers below the grid and the press "Set Values".`);
  step1.style('margin-top', 0);
  step1.style('margin-bottom', 0);
  step2 = createP(`<b>2.</b> Once the configuration is drawn, you can press the button "Reconfigure" to run the algorithm.<br>
  Make sure the configuration is fully connected otherwise a warning message will appear.`);
  step2.style('margin-top', 0);
  step2.style('margin-bottom', 0);
  step3 = createP(`<b>3.</b> Once we are in the display view, you can move through the different reconfiguration steps by using the buttons "Prev" and "Next".<br>
  In yellow you will see the path done by the green module to get to the cell circled in red.`);
  step3.style('margin-top', 0);
  step3.style('margin-bottom', 0);
  step4 = createP(`<b>4.</b> To try a new configuration, you can press the  "Go Back" button.`);
  step4.style('margin-top', 0);
  step4.style('margin-bottom', 0);
  featuresTitle = createElement('h3', 'Further Features');
  downloadUploadP = createP(`<b>Download & Upload configuration:</b> By clicking the "Download Configuration" button, you can download a text file containing a matrix with the current configuration.<br>
  On the other hand, by placing a file in the Input File box and pressing the button "Paint" you can load any configuration from a file with the same structure as the download one.`);
  downloadUploadP.style('margin-top', 0);
  downloadUploadP.style('margin-bottom', 0);
  moveXStepsP = createP(`<b>Forward/Rewind X steps:</b> By writting a number of steps in the text box between the buttons "Forward" and "Rewind", you can advance or rewind the number of stages you typed.`);
  moveXStepsP.style('margin-top', 0);
  moveXStepsP.style('margin-bottom', 0);
  playAndStop = createP(`<b>Play/Stop reconfiguration:</b> When displayed, by default the reconfiguration will advance by moving the modules around until it reaches the last stage.<br>
  By pressing the button "Stop" the reconfiguration will pause. In the same way, by pressing the button "Play" the reconfiguration will continue.`);
  playAndStop.style('margin-top', 0);
  playAndStop.style('margin-bottom', 0);
  simulatorButton = createButton('To Simulator');
  simulatorButton.mousePressed(switchToEditView);

  //Edit View
  cnvs = createCanvas(m*squareSize, n*squareSize);
  inputN = createInput(n);
  inputN.size(40, 15);
  inputM = createInput(m);
  inputM.size(40, 15);
  redrawButton = createButton('Set Values');
  redrawButton.mouseClicked(updateValues);
  clearButton = createButton('Clear');
  clearButton.mouseClicked(clearGrid);
  reconfigureButton = createButton('Reconfigure');
  reconfigureButton.mouseClicked(startReconfiguration);
  rowsP = createP('Rows:');
  rowsP.style('margin-top', 0);
  rowsP.style('margin-bottom', 0);
  rowsP.size(45, rowsP.height);
  columnsP = createP('Columns:');
  columnsP.style('margin-top', 0);
  columnsP.style('margin-bottom', 0);
  columnsP.size(55, columnsP.height);
  incorrectP = createP('The configuration is not fully connected or does not reach all grid limits.');
  incorrectP.style('margin-top', 0);
  incorrectP.style('margin-bottom', 0);
  incorrectP.style('color', 'red');
  incorrectP.size(475, columnsP.height);
  fileInput = createFileInput(handleFile);
  paintButton = createButton('Paint');
  paintButton.mouseClicked(paintConfiguration);
  downloadButton = createButton('Download configuration');
  downloadButton.mouseClicked(downloadConfiguration);
  nModulesP = createP('0 Modules');
  nModulesP.style('margin-top', 0);
  nModulesP.style('margin-bottom', 0);
  instructionsButton = createButton("See Instructions");
  instructionsButton.mouseClicked(switchToInstructions);

  //Display view
  backButton = createButton('Go back');
  backButton.mouseClicked(backToStart);
  nextStepButton = createButton('Next >');
  nextStepButton.mouseClicked(nextStep);
  previousStepButton = createButton('< Prev');
  previousStepButton.mouseClicked(prevStep);
  stepP = createP('0/0');
  stepP.style('margin-top', 0);
  stepP.style('margin-bottom', 0);
  stepP.style('text-align', 'center');
  stepP.size(50, stepP.height);
  timeStepsP = createP('Time: ');
  timeStepsP.style('margin-top', 0);
  timeStepsP.style('margin-bottom', 0);
}

function switchView(view, useMat){
  if(view == 0){//Instructions
    //Switch visibles
    cnvs.hide();
    nModulesP.hide();
    rowsP.hide();
    inputN.hide();
    columnsP.hide();
    inputM.hide();
    redrawButton.hide();
    clearButton.hide();
    reconfigureButton.hide();
    incorrectP.hide();
    fileInput.hide();
    paintButton.hide();
    downloadButton.hide();
    instructionsButton.hide()

    subtitle.show();
    step1.show();
    step2.show();
    step3.show();
    step4.show();
    featuresTitle.show();
    downloadUploadP.show();
    moveXStepsP.show();
    playAndStop.show();
    simulatorButton.show();
  }
  else if(view == 1){//Edit view
    subtitle.hide();
    step1.hide();
    step2.hide();
    step3.hide();
    step4.hide();
    featuresTitle.hide();
    downloadUploadP.hide();
    moveXStepsP.hide();
    playAndStop.hide();
    simulatorButton.hide();

    //Hide display components
    backButton.hide();
    previousStepButton.hide();
    stepP.hide();
    nextStepButton.hide();
    timeStepsP.hide();

    cnvs.show();
    nModulesP.show();
    rowsP.show();
    inputN.show();
    columnsP.show();
    inputM.show();
    redrawButton.show();
    clearButton.show();
    reconfigureButton.show();
    fileInput.show();
    paintButton.show();
    downloadButton.show();
    instructionsButton.show()

    // Create the canvas
    clear();
    nModules = 0;
    display = false; //Flag Down
    actualPath = [];
    if(!useMat)initMatrix();
    cnvs.size(m*squareSize, n*squareSize);
    
    // Set colors
    fill(256);
    stroke(127, 63, 120);
    strokeWeight(2);
    background(256);
    
    for(let i = 0; i < n; ++i){
      for (let j = 0; j < m; j ++) {
        if(matrix[i][j] == 1){
          if(useMat) ++nModules;
          fill(0, 0, 256);
        }
        else fill(256);
        square(0, 0, squareSize);
        translate(squareSize, 0);
      }
      translate(-squareSize*m, squareSize);
    }

    inputN.value(n);
    inputM.value(m);
    nModulesP.html(nModules + ' Modules');
    
    nModulesP.position(cnvs.x + cnvs.width + 10,  cnvs.y + cnvs.height - 20);
    rowsP.position(cnvs.x, cnvs.y + cnvs.height + 10);
    inputN.position(rowsP.x + rowsP.width, rowsP.y);
    columnsP.position(inputN.x + inputN.width + 10, rowsP.y);
    inputM.position(columnsP.x + columnsP.width + 10, rowsP.y);
    redrawButton.position(inputM.x + inputM.width + 10, rowsP.y);
    clearButton.position(redrawButton.x + redrawButton.width + 10, rowsP.y);
    reconfigureButton.position(cnvs.x, rowsP.y + rowsP.height + 10);
    incorrectP.position(reconfigureButton.x + reconfigureButton.width + 10, reconfigureButton.y);
    fileInput.position(cnvs.x, reconfigureButton.y + reconfigureButton.height + 10);
    paintButton.position(fileInput.x + fileInput.width + 10, fileInput.y);
    downloadButton.position(cnvs.x, fileInput.y + fileInput.height + 10);
    instructionsButton.position(cnvs.x, downloadButton.y + downloadButton.height + 30);
  }
  else if(view == 2){//Display view
    //Hide edit components
    redrawButton.hide();
    clearButton.hide();
    reconfigureButton.hide();
    rowsP.hide();
    inputN.hide();
    columnsP.hide();
    inputM.hide();
    incorrectP.hide();
    fileInput.hide();
    paintButton.hide();
    instructionsButton.hide();
    

    //Show display components
    backButton.show();
    previousStepButton.show();
    stepP.show();
    nextStepButton.show();
    timeStepsP.show();

    clear();
    display = true; //Flag Up
    stage = 0;
    totalStages = reconfSteps.length + 1;
    cnvs.size((matrix[0].length)*squareSize, (matrix.length)*squareSize);

    // Set colors
    fill(256);
    stroke(127, 63, 120);
    background(256);

    for(let i = 0; i < matrix.length; ++i){
      for (let j = 0; j < matrix[0].length; ++j) {
        fill(256);
        if(matrix[i][j]) fill(0,0,256); //module
        square(0, 0, squareSize);
        translate(squareSize, 0);
      }
      translate(-squareSize*(matrix[0].length), 0)
      translate(0, squareSize);
    }

    stepP.html(stage.toString()+'/'+totalStages.toString());
    timeStepsP.html('Time: ' + computationTime.toString() + ' seconds' + '    Number of steps: ' + nSteps.toString());

    timeStepsP.position(cnvs.x, cnvs.y + cnvs.height + 10);
    nModulesP.position(timeStepsP.x,  timeStepsP.y + timeStepsP.height + 10);
    backButton.position(nModulesP.x, nModulesP.y + nModulesP.height + 10);
    previousStepButton.position(backButton.x + backButton.width + 50, backButton.y);
    stepP.position(previousStepButton.x + previousStepButton.width + 10, previousStepButton.y);
    nextStepButton.position(stepP.x + stepP.width + 10, stepP.y);
    downloadButton.position(cnvs.x, backButton.y + backButton.height + 10);
  }
}

function switchToInstructions(){
  switchView(0);
}

function switchToEditView(){
  switchView(1);
}

function updateValues(){
  n = Number(inputN.value());
  m = Number(inputM.value());
  switchView(1);
}

function clearGrid(){
  switchView(1);
}

function backToStart(){
  switchView(1);
}

function draw(){
  if(!display && mouseIsPressed){
    var i = Math.floor(mouseY/squareSize);
    var j = Math.floor(mouseX/squareSize);

    if(i < n && j < m && i >= 0 && j >= 0){
      fill(256);
      square(squareSize*j, squareSize*i, squareSize); //Paint it white

      if(paint){
        if(!matrix[i][j]){
          ++nModules;
          nModulesP.html(nModules + ' Modules');
        }
        fill(0, 0, 256); //Selected in blue
        matrix[i][j] = 1;
      }
      else{
        if(matrix[i][j]){
          --nModules;
          nModulesP.html(nModules + ' Modules');
        }
        fill(256); //Non selected in yellow
        matrix[i][j] = 0;
      }
      square(squareSize*j, squareSize*i, squareSize); //Paint final color
    }
  }
}

function initMatrix(){
  matrix = new Array(n);
  for(let i = 0; i < n; ++i){
    matrix[i] = new Array(m);
    matrix[i].fill(0);
  }
}

function mousePressed() {
  if(!display){
    var i = Math.floor(mouseY/squareSize);
    var j = Math.floor(mouseX/squareSize);
    // console.log('X: ', mouseX, ' and Y: ', mouseY);
    // console.log('I: ', i, ' and J: ', j);
    if(i < n && j < m && i >= 0 && j >= 0){
      if(matrix[i][j] == 0)
        paint = true;
      else
        paint = false;
    }
  }
}

function startReconfiguration(){
  console.log('MATRIX: ', matrix);
  
  if(matrixCheckAndCrop()){

    initialConfiguration = new Array(matrix.length);
    for(let i = 0; i < matrix.length; ++i){
      initialConfiguration[i] = Object.assign([], matrix[i]);
    }
    var startTime = new Date().getTime();
    reconfSteps = main(matrix);
    computationTime = (new Date().getTime() - startTime)/1000;

    //Adapt matrix
    matrix.map(row=>{
      row.unshift(0);
      row.push(0);
    })
    matrix.unshift(new Array(matrix[0].length));
    matrix.push(new Array(matrix[0].length));
    matrix[0].fill(0);
    matrix[matrix.length-1].fill(0);

    //Compute number of slidings
    nSteps = 0;
    for(let k = 0; k < reconfSteps.length; ++k){
      var path = findPath(k);
      nSteps += path.length-1;
      matrix[reconfSteps[k].from[0]+1][reconfSteps[k].from[1]+1] = 0;
      matrix[reconfSteps[k].to[0]+1][reconfSteps[k].to[1]+1] = 1;
    }

    //Return matrix to first state
    for(let k = reconfSteps.length-1; k >= 0; --k){
      matrix[reconfSteps[k].from[0]+1][reconfSteps[k].from[1]+1] = 1;
      matrix[reconfSteps[k].to[0]+1][reconfSteps[k].to[1]+1] = 0;
    }

    //Move to display screen
    stepsDisplaySetup();

  }
  else{
    incorrectP.show();
  }

}

function matrixCheckAndCrop(){
  //Crop matrix
  var top, left, bottom, right;
  for(let i = 0; i < n; ++i){
    for(let j = 0; j < m; ++j){
      //Check top bottom
      if(top == undefined && matrix[i][j]) top = i;
      if(bottom == undefined && matrix[matrix.length-1-i][j]) bottom = matrix.length-1-i;

      //If all sides encountered then break
      if(top != undefined && bottom != undefined) break;
    }
  }

  for(let j = 0; j < m; ++j){
    for(let i = top; i <= bottom; ++i){
      //Check left right
      if(left == undefined && matrix[i][j]) left = j;
      if(right == undefined && matrix[i][matrix[0].length-1-j]) right = matrix[0].length-1-j;

      //If all sides encountered then break
      if(left != undefined && right != undefined) break;
    }
  }

  if(!(top != undefined && left != undefined && bottom != undefined && right != undefined)) return false;

  //Check that it is fully connected
  //List all modules
  var selectedCells = new Array(0);
  for(let i = top; i <= bottom; ++i)
    for(let j = left; j <= right; ++j){
      if(matrix[i][j]) selectedCells.push([i,j]);
    }

  //BFS from first module found
  var seen = selectedBFS(selectedCells[0][0], selectedCells[0][1]);

  //Check if all visited
  var correct = selectedCells.reduce((prev, curr)=>{return prev && seen[curr[0]][curr[1]];}, true);
  if(correct){
    var croppedMatrix = [];
    for(let i = top; i <= bottom; ++i){
      croppedMatrix.push(matrix[i].slice(left, right+1));
    }
    matrix = croppedMatrix;
    return true;
  }
  return false;
}

function selectedBFS(initI, initJ){
  var checkedCells = new Array(n);
  for(let i = 0; i < n; ++i){
    checkedCells[i] = new Array(m);
    checkedCells[i].fill(false);
  }

  var toCheck = [[initI, initJ]];
  checkedCells[initI][initJ] = true;
  while(toCheck.length){
    var current = toCheck[0];
    if(current[0] > 0){
      if(matrix[current[0]-1][current[1]] && !checkedCells[current[0]-1][current[1]]){
        checkedCells[current[0]-1][current[1]] = true;
        toCheck.push([current[0]-1, current[1]]);
      }
    }
    if(current[1] > 0){
      if(matrix[current[0]][current[1]-1] && !checkedCells[current[0]][current[1]-1]){
        checkedCells[current[0]][current[1]-1] = true;
        toCheck.push([current[0], current[1]-1]);
      }
    }
    if(current[0] < n-1){
      if(matrix[current[0]+1][current[1]] && !checkedCells[current[0]+1][current[1]]){
        checkedCells[current[0]+1][current[1]] = true;
        toCheck.push([current[0]+1, current[1]]);
      }
    }
    if(current[1] < m-1){
      if(matrix[current[0]][current[1]+1] && !checkedCells[current[0]][current[1]+1]){
        checkedCells[current[0]][current[1]+1] = true;
        toCheck.push([current[0], current[1]+1]);
      }
    }
    toCheck.shift();
  }
  return checkedCells;
}

function stepsDisplaySetup(){
  switchView(2);
}

function nextStep(){
  if(stage < totalStages){
    if(stage > 0){
      matrix[reconfSteps[stage-1].from[0]+1][reconfSteps[stage-1].from[1]+1] = 0;
      matrix[reconfSteps[stage-1].to[0]+1][reconfSteps[stage-1].to[1]+1] = 1;
    }

    var cellsToPaint;
    if(stage < totalStages-1) cellsToPaint = findPath(stage);
    else cellsToPaint = [];

    ++stage;
    updateDisplay(cellsToPaint, false);
  }
}

function prevStep(){
  if(stage > 0){
    --stage;
    var cellsToPaint;
    if(stage > 0){
      matrix[reconfSteps[stage-1].from[0]+1][reconfSteps[stage-1].from[1]+1] = 1;
      matrix[reconfSteps[stage-1].to[0]+1][reconfSteps[stage-1].to[1]+1] = 0;

      cellsToPaint = findPath(stage-1);
    }
    else cellsToPaint = [];
    updateDisplay(cellsToPaint, true);
  }
}

function findPath(stage){ //inverted true if prev button
  var moduleCell = Object.assign([], reconfSteps[stage].from);
  ++moduleCell[0];
  ++moduleCell[1];
  var gapCell = Object.assign([], reconfSteps[stage].to);
  ++gapCell[0];
  ++gapCell[1];

  var paths = [];
  for(let i = 0; i < 4; ++i){ //FIND all initial cells and paths
    if(i == 0 && moduleCell[0] > 0 && !matrix[moduleCell[0]-1][moduleCell[1]]) paths.push({path: [moduleCell, [moduleCell[0]-1, moduleCell[1]]], dir: (i+1)%4});
    if(i == 1 && moduleCell[1] > 0 && !matrix[moduleCell[0]][moduleCell[1]-1]) paths.push({path: [moduleCell, [moduleCell[0], moduleCell[1]-1]], dir: (i+1)%4});
    if(i == 2 && moduleCell[0] < n+1 && !matrix[moduleCell[0]+1][moduleCell[1]]) paths.push({path: [moduleCell, [moduleCell[0]+1, moduleCell[1]]], dir: (i+1)%4});
    if(i == 3 && moduleCell[1] < m+1 && !matrix[moduleCell[0]][moduleCell[1]+1]) paths.push({path: [moduleCell, [moduleCell[0], moduleCell[1]+1]], dir: (i+1)%4});
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
        else if(paths[i].dir == 2 && actualMod[0] < n+1) {
          if(!matrix[actualMod[0]+1][actualMod[1]]) nextCell = [actualMod[0]+1, actualMod[1]];
        }
        else if(paths[i].dir == 3 && actualMod[1] < m+1){
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


function updateDisplay(cellsToPaint, inverted){
  //Set colors
  stroke(127, 63, 120);
  
  //Clean grid
  for(let i = 0; i < actualPath.length; ++i){
    fill(256);
    if((i == actualPath.length-1 && !inverted) || (i == 0 && inverted)) fill(0,0,256);
    square(actualPath[i][1]*squareSize, actualPath[i][0]*squareSize, squareSize);
  }

  //Update values
  stepP.html(stage.toString()+'/'+totalStages.toString());

  //Paint new path
  for(let i = 1; i < cellsToPaint.length-1; ++i){ //Paint Path
    fill(256);
    square(cellsToPaint[i][1]*squareSize, cellsToPaint[i][0]*squareSize, squareSize);
    fill(256, 256, 0);
    square(cellsToPaint[i][1]*squareSize, cellsToPaint[i][0]*squareSize, squareSize);
  }

  //Paint beginning and end
  if(cellsToPaint.length){
    fill(0, 256, 0);
    stroke(0,256,0);
    square(cellsToPaint[0][1]*squareSize, cellsToPaint[0][0]*squareSize, squareSize);
    fill(256);
    stroke(256,0,0);
    square(cellsToPaint[cellsToPaint.length-1][1]*squareSize, cellsToPaint[cellsToPaint.length-1][0]*squareSize, squareSize);
  }
  actualPath = cellsToPaint;
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function downloadConfiguration(){
  var confStr;
  if(!display){
    confStr = JSON.stringify(matrix);
  }
  else{
    confStr = JSON.stringify(initialConfiguration);
  }
  confStr = confStr.replace(/],/g, "],\n");
  download("configuration.txt", confStr);
}

function handleFile(file) {
  // If it's an image file
  if (file.type === 'text') {
    uploadedFile = file;
  } else {
    console.log('Not a text file!');
  }
}

function paintConfiguration(){
  var data = uploadedFile.data;
  data = data.replace(/\n/g, '');
  matrix = JSON.parse(data);
  n = matrix.length;
  m = matrix[0].length;
  switchView(1, true);
}