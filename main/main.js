let seconds = 0;
let timerInterval = null;
let originaleAnordnung = null;
let shuffeleddata = null;
let feld = 3;
let highscore = null;

function startTimer() {
    const data = loadData();
    if (data.currentTime != null) {
        seconds = data.currentTime;
    }
    else {
        seconds = 0;
    }

    timerInterval = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);

}

function updateTimerDisplay() {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const timeString = `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
    document.getElementById("gameTimer").innerText = timeString;
}

function padZero(num) {
    return num < 10 ? '0' + num : num;
}

window.addEventListener("DOMContentLoaded", () => {
    startTimer();
    loadName();
    ersetzeMitKleinenCanvases();
    loadImage();
    loadHighscore();
});


function loadImage() {
    const data = loadData();
    base64ToImageData(data.imageData, (imageData) => {
        originaleAnordnung = splitImageData(imageData, feld, feld);
        originaleAnordnung[originaleAnordnung.length - 1] = emptyTile(
            originaleAnordnung[0].width,
            originaleAnordnung[0].height
        );

        if (data.formation == null) {

            //shuffeleddata = generateUniqueRandomIndices(originaleAnordnung.length);
            shuffleSave(originaleAnordnung.length);
        } else {
            shuffeleddata = data.formation;
        }
        placeAll();
    });
}

function placeAll() {
    for (let i = 0; i < shuffeleddata.length; i++) {
        place(i, shuffeleddata[i]);
    }
}

function moveTile(event) {
    let id = event.srcElement.id;
    id = parseInt(id.replace("canvas_", ""));
    let indexabove = idAbove(id);
    let indexleft = idLeft(id);
    let indexright = idRight(id);
    let indexbelow = idBelow(id);

    if (indexabove != null && shuffeleddata[indexabove] == shuffeleddata.length - 1) {
        const temp = shuffeleddata[indexabove];
        shuffeleddata[indexabove] = shuffeleddata[id];
        shuffeleddata[id] = temp;
        placeAll();
        if(istInReihenfolge()){
            highscore= seconds;
            save();
            loadHighscore();
            winAlert();
            
        }
        return;
    }
    if (indexleft != null && shuffeleddata[indexleft] == shuffeleddata.length - 1) {
        const temp = shuffeleddata[indexleft];
        shuffeleddata[indexleft] = shuffeleddata[id];
        shuffeleddata[id] = temp;
        placeAll();
        if(istInReihenfolge()){
            highscore= seconds;
            save();
            loadHighscore();
            winAlert();
        }
        return;
    }
    if (indexright != null && shuffeleddata[indexright] == shuffeleddata.length - 1) {
        const temp = shuffeleddata[indexright];
        shuffeleddata[indexright] = shuffeleddata[id];
        shuffeleddata[id] = temp;
        placeAll();
        if(istInReihenfolge()){
            highscore= seconds;
            save();
            loadHighscore();
            winAlert();
        }
        return;
    }
    if (indexbelow != null && shuffeleddata[indexbelow] == shuffeleddata.length - 1) {
        const temp = shuffeleddata[indexbelow];
        shuffeleddata[indexbelow] = shuffeleddata[id];
        shuffeleddata[id] = temp;
        placeAll();
        if(istInReihenfolge()){
            highscore= seconds;
            save();
            loadHighscore();
            winAlert();
        }
        return;
    }

}
function idAbove(index) {
    let row = Math.floor(index / feld); // Zeile berechnen
    if (row > 0) {
        return index - feld; // Index des Feldes oben
    } else {
        return null; // Rand, kein Feld oben
    }
}

// Funktion für das Feld links
function idLeft(index) {
    let col = index % feld; // Spalte berechnen
    if (col > 0) {
        return index - 1; // Index des Feldes links
    } else {
        return null; // Rand, kein Feld links
    }
}

// Funktion für das Feld rechts
function idRight(index) {
    let col = index % feld; // Spalte berechnen
    if (col < feld - 1) {
        return index + 1; // Index des Feldes rechts
    } else {
        return null; // Rand, kein Feld rechts
    }
}

// Funktion für das Feld unten
function idBelow(index) {
    let row = Math.floor(index / feld); // Zeile berechnen
    if (row < feld - 1) {
        return index + feld; // Index des Feldes unten
    } else {
        return null; // Rand, kein Feld unten
    }
}


function place(id_canvas, id_data) {
    const tile = originaleAnordnung[id_data];
    const canvas = document.getElementById("canvas_" + id_canvas.toString());
    const ctx = canvas.getContext('2d');

    const tileImageData = new ImageData(tile.data, tile.width, tile.height);
    ctx.putImageData(tileImageData, 0, 0);
}

function loadName() {
    const urlParams = new URLSearchParams(window.location.search);
    let name = urlParams.get('DateiName');
    name = name.replace(/\.[^/.]+$/, '');
    const text = document.getElementById("nameText")
    text.textContent = "Name: " + name;

}

//Saves data in local stroage
function save() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('DateiName');
    const data = loadData();
    data.formation = shuffeleddata;
    data.currentTime = seconds;
    if(data.highscore!=null&&highscore!=null&&data.highscore>highscore)
    {
        data.highscore=highscore;   
    }
    else if (data.highscore==null&&highscore!=null){
        data.highscore=highscore;   

    }
    localStorage.setItem(name, JSON.stringify(data));

}

//Loads saved data object from loacal Storage
function loadData() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('DateiName');
    const jsonString = localStorage.getItem(name);
    const data = JSON.parse(jsonString);
    return data;
}


function changeImage() {
    //Online Library for confirm button with custom text
    Swal.fire({
        title: 'Save Game?',
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: "Don't save"
    }).then((result) => {
        if (result.isConfirmed) {
            save();
            window.location.href = "start.html";
        } else {
            window.location.href = "start.html";
        }
    });
}
function reset() {
    Swal.fire({
        title: 'Reset Game?',
        showCancelButton: true,
        confirmButtonText: 'Reset',
        cancelButtonText: "Don't Reset"
    }).then((result) => {
        if (result.isConfirmed) {
            seconds = 0;
            // shuffeleddata = generateUniqueRandomIndices(shuffeleddata.length);
            shuffleSave(originaleAnordnung.length);
            placeAll();

            save();
        }
    });

}
function ersetzeMitKleinenCanvases() {
    const puzzlefeld = document.getElementById('puzzlefeldBild');
    puzzlefeld.innerHTML = ''; // Alles alte löschen
    puzzlefeld.style.display = 'flex';
    puzzlefeld.style.flexWrap = 'wrap';
    puzzlefeld.style.alignContent = 'flex-start';

    for (let i = 0; i < feld * feld; i++) {
        const kleinesCanvas = document.createElement('canvas');
        const size = parseInt(500 / feld);
        kleinesCanvas.width = size;  // kleine Canvas Größe (kannst du anpassen)
        kleinesCanvas.height = size;
        kleinesCanvas.style.width = `${100 / feld}%`; // 5 pro Zeile
        kleinesCanvas.style.height = `${100 / feld}%`;
        kleinesCanvas.id = "canvas_" + i.toString();
        kleinesCanvas.addEventListener("click", moveTile);
        puzzlefeld.appendChild(kleinesCanvas);
    }
}



/*******************************************************
 *Functions to split image in smaller images ***********
 *******************************************************/

function splitImageData(imageData, rows, cols) {
    const { width, height, data } = imageData;
    const tileWidth = Math.floor(width / cols);
    const tileHeight = Math.floor(height / rows);

    const tiles = [];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const tileData = new Uint8ClampedArray(tileWidth * tileHeight * 4);

            for (let y = 0; y < tileHeight; y++) {
                for (let x = 0; x < tileWidth; x++) {
                    const srcX = col * tileWidth + x;
                    const srcY = row * tileHeight + y;
                    const srcIndex = (srcY * width + srcX) * 4;

                    const dstIndex = (y * tileWidth + x) * 4;

                    tileData[dstIndex] = data[srcIndex];
                    tileData[dstIndex + 1] = data[srcIndex + 1];
                    tileData[dstIndex + 2] = data[srcIndex + 2];
                    tileData[dstIndex + 3] = data[srcIndex + 3];
                }
            }

            const tile = {
                width: tileWidth,
                height: tileHeight,
                data: tileData
            };

            tiles.push(tile);
        }
    }

    return tiles;
}
function base64ToImageData(base64, callback) {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        callback(imageData);
    };
    img.onerror = (err) => {
        console.error('Fehler beim Laden des Base64-Bildes:', err);
    };
}


function emptyTile(tileWidth, tileHeight) {
    const tileData = new Uint8ClampedArray(tileWidth * tileHeight * 4); // Alles 0 = transparent
    return {
        width: tileWidth,
        height: tileHeight,
        data: tileData
    };
}


function generateUniqueRandomIndices(arrayLength) {
    const indices = [];

    // Array mit allen Indizes von 0 bis arrayLength-1 füllen
    for (let i = 0; i < arrayLength; i++) {
        indices.push(i);
    }

    // Fisher-Yates Algorithmus zum Mischen der Indizes
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]]; // Tauschen
    }

    return indices;
}




function shuffleSave(arrayLength) {
    shuffeleddata = [];

    // Fill the array with all indices from 0 to arrayLength-1
    for (let i = 0; i < arrayLength; i++) {
        shuffeleddata.push(i);
    }

    function shuffleStep(i) {
        if (i >=50) return;  // Limit the number of steps to 500

        let empty = shuffeleddata.indexOf(shuffeleddata.length - 1);
        
        let above = idAbove(empty);
        let left = idLeft(empty);
        let right = idRight(empty);
        let down = idBelow(empty);

        // Initialize an array of potential valid neighboring positions
        let validNeighbors = [];

        if (above != null) validNeighbors.push(above);
        if (left != null) validNeighbors.push(left);
        if (right != null) validNeighbors.push(right);
        if (down != null) validNeighbors.push(down);

        // Select a random neighbor for the swap
        const swapIndex = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];

        // Swap values
        const temp = shuffeleddata[swapIndex];
        shuffeleddata[swapIndex] = shuffeleddata[empty];
        shuffeleddata[empty] = temp;

        // Place the updated tiles
        placeAll();

        // Schedule the next shuffle step after a delay
        setTimeout(() => shuffleStep(i + 1), 1);  // 100ms delay between steps
    }

    // Start the shuffle
    shuffleStep(0);
}
function istInReihenfolge() {
    for (let i = 0; i < shuffeleddata.length - 1; i++) {
      if (shuffeleddata[i] > shuffeleddata[i + 1]) {
        return false; 
      }
    }
    return true;  // Alle Werte sind in Reihenfolge
  }
  function loadHighscore (){
    let data = loadData();
let textelemet= document.getElementById("HighscoreTime");

    if (data.highscore==null){
        textelemet.innerText= "- : - : -";
    }
    else {
        const hours = Math.floor(data.highscore / 3600);
        const minutes = Math.floor((data.highscore % 3600) / 60);
        const secs = data.highscore % 60;
    
        const timeString = `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
textelemet.innerText= timeString;
    }
  }
  


  function winAlert (){
    Swal.fire({
        title: 'You Won!',
        showCancelButton: false,
        confirmButtonText: 'OK',
    }).then((result) => {});

  }
