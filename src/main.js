// ****************************************************************************************************
// Global Variables
// ****************************************************************************************************
let dataInDb;
let seconds = 0;                   // Seconds counter for game time
let timerInterval = null;          // Reference to the interval timer
let originaleAnordnung = null;     // Original arrangement of image tiles
let shuffeleddata = null;          // Current shuffled arrangement
let feld = 3;                      // Board size (3x3 puzzle)
let highscore = null;              // Best (lowest) time

// ****************************************************************************************************
// On Page Load
// ****************************************************************************************************
window.addEventListener("DOMContentLoaded", async () => {
    dataInDb = await loadData();
    startTimer();
    loadName();
    ersetzeMitKleinenCanvases();
    loadImage();
    loadHighscore();
});

// ****************************************************************************************************
// Load Data
// ****************************************************************************************************
async function loadData() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('DateiName');
    return await getDatafromDb(name);
}

// ****************************************************************************************************
// Timer
// ****************************************************************************************************
async function startTimer() {
    seconds = dataInDb.currentTime ?? 0;

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
    return num < 10 ? `0${num}` : num;
}

// ****************************************************************************************************
// UI Display
// ****************************************************************************************************
function loadName() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('DateiName').replace(/\.[^/.]+$/, '');
    document.getElementById("nameText").textContent = `Name: ${name}`;
}

function loadHighscore() {
    const element = document.getElementById("HighscoreTime");

    if (dataInDb.highscore == null) {
        element.innerText = "- : - : -";
    } else {
        const hours = Math.floor(dataInDb.highscore / 3600);
        const minutes = Math.floor((dataInDb.highscore % 3600) / 60);
        const secs = dataInDb.highscore % 60;
        element.innerText = `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
    }
}

// ****************************************************************************************************
// Image Handling
// ****************************************************************************************************
function loadImage() {
    base64ToImageData(dataInDb.imageData, (imageData) => {
        originaleAnordnung = splitImageData(imageData, feld, feld);

        // Create empty tile for the puzzle
        originaleAnordnung[originaleAnordnung.length - 1] = emptyTile(
            originaleAnordnung[0].width,
            originaleAnordnung[0].height
        );

        if (dataInDb.formation == null) {
            shuffleSave(originaleAnordnung.length);
        } else {
            shuffeleddata = dataInDb.formation;
        }

        placeAll();
    });
}

// ****************************************************************************************************
// Gameplay Interaction
// ****************************************************************************************************
function moveTile(event) {
    const id = parseInt(event.srcElement.id.replace("canvas_", ""));
    const directions = [idAbove(id), idLeft(id), idRight(id), idBelow(id)];

    for (const direction of directions) {
        if (direction != null && shuffeleddata[direction] === shuffeleddata.length - 1) {
            [shuffeleddata[direction], shuffeleddata[id]] = [shuffeleddata[id], shuffeleddata[direction]];
            placeAll();

            if (istInReihenfolge()) {
                highscore = seconds;
                save();
                loadHighscore();
                winAlert();
            }
            return;
        }
    }
}

function idAbove(index) {
    return Math.floor(index / feld) > 0 ? index - feld : null;
}

function idLeft(index) {
    return index % feld > 0 ? index - 1 : null;
}

function idRight(index) {
    return index % feld < feld - 1 ? index + 1 : null;
}

function idBelow(index) {
    return Math.floor(index / feld) < feld - 1 ? index + feld : null;
}

function placeAll() {
    for (let i = 0; i < shuffeleddata.length; i++) {
        place(i, shuffeleddata[i]);
    }
}

function place(idCanvas, idData) {
    const tile = originaleAnordnung[idData];
    const canvas = document.getElementById(`canvas_${idCanvas}`);
    const ctx = canvas.getContext('2d');
    const tileImageData = new ImageData(tile.data, tile.width, tile.height);
    ctx.putImageData(tileImageData, 0, 0);
}

function istInReihenfolge() {
    for (let i = 0; i < shuffeleddata.length - 1; i++) {
        if (shuffeleddata[i] > shuffeleddata[i + 1]) return false;
    }
    return true;
}

function winAlert() {
    Swal.fire({
        title: 'You Won!',
        showCancelButton: false,
        confirmButtonText: 'OK',
    });
}

// ****************************************************************************************************
// Button Actions
// ****************************************************************************************************
function save() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('DateiName');
    dataInDb.formation = shuffeleddata;
    dataInDb.currentTime = seconds;

    if (dataInDb.highscore != null && highscore != null && dataInDb.highscore > highscore) {
        dataInDb.highscore = highscore;
    } else if (dataInDb.highscore == null && highscore != null) {
        dataInDb.highscore = highscore;
    }

    saveInDb(name, dataInDb);
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
            shuffleSave(originaleAnordnung.length);
            placeAll();
            save();
        }
    });
}

function changeImage() {
    Swal.fire({
        title: 'Save Game?',
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: "Don't save"
    }).then((result) => {
        if (result.isConfirmed) save();
        window.location.href = "start.html";
    });
}

// ****************************************************************************************************
// Puzzle Board Setup
// ****************************************************************************************************
function ersetzeMitKleinenCanvases() {
    const puzzlefeld = document.getElementById('puzzlefeldBild');
    puzzlefeld.innerHTML = '';
    puzzlefeld.style.display = 'flex';
    puzzlefeld.style.flexWrap = 'wrap';
    puzzlefeld.style.alignContent = 'flex-start';

    const size = parseInt(500 / feld);

    for (let i = 0; i < feld * feld; i++) {
        const kleinesCanvas = document.createElement('canvas');
        kleinesCanvas.width = size;
        kleinesCanvas.height = size;
        kleinesCanvas.style.width = `${100 / feld}%`;
        kleinesCanvas.style.height = `${100 / feld}%`;
        kleinesCanvas.id = `canvas_${i}`;
        kleinesCanvas.addEventListener("click", moveTile);
        puzzlefeld.appendChild(kleinesCanvas);
    }
}

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
                    tileData.set(data.slice(srcIndex, srcIndex + 4), dstIndex);
                }
            }
            tiles.push({ width: tileWidth, height: tileHeight, data: tileData });
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
        callback(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };

    img.onerror = (err) => {
        console.error('Error loading Base64 image:', err);
    };
}

function emptyTile(tileWidth, tileHeight) {
    const tileData = new Uint8ClampedArray(tileWidth * tileHeight * 4);
    return { width: tileWidth, height: tileHeight, data: tileData };
}

function shuffleSave(arrayLength) {
    shuffeleddata = [...Array(arrayLength).keys()];

    function shuffleStep(i) {
        if (i >= 50) return;

        const empty = shuffeleddata.indexOf(shuffeleddata.length - 1);
        const validNeighbors = [idAbove(empty), idLeft(empty), idRight(empty), idBelow(empty)].filter(n => n != null);
        const swapIndex = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];

        [shuffeleddata[swapIndex], shuffeleddata[empty]] = [shuffeleddata[empty], shuffeleddata[swapIndex]];

        placeAll();
        setTimeout(() => shuffleStep(i + 1), 1);
    }

    shuffleStep(0);
}

// ****************************************************************************************************
// Database Interaction
// ****************************************************************************************************
async function getDatafromDb(name) {
    const url = `http://127.0.0.1:3000/GETDATA?name=${name}`;
    const response = await fetch(url);
    const text = await response.text();
    const object = JSON.parse(text);
    return JSON.parse(object.data);
}

async function saveInDb(name, data) {
    const url = `http://127.0.0.1:3000/UPDATEE?name=${name}`;
    const jsondata = JSON.stringify(data);

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: jsondata
    })
        .then(response => {
            if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
            return response.text();
        })
        .catch(error => {
            console.error('Fetch operation failed:', error);
        });
}
