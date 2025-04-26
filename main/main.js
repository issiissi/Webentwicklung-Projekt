let seconds = 0;
let timerInterval = null;
let originaleAnordnung = null;

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
});

function loadImage() {
    const data = loadData();
    base64ToImageData(data.imageData, (imageData) => {
        originaleAnordnung = splitImageData(imageData, 5, 5); // 5x5 Felder
        originaleAnordnung[originaleAnordnung.length - 1] = leeresTile(originaleAnordnung[0].width, originaleAnordnung[0].height);
        for (let i = 0; i < originaleAnordnung.length; i++) {
            const tile = originaleAnordnung[i];
            const canvas = document.getElementById("canvas_" + i.toString());
            const ctx = canvas.getContext('2d');

            const tileImageData = new ImageData(tile.data, tile.width, tile.height);
            ctx.putImageData(tileImageData, 0, 0);
        }
    });
}


function loadName() {
    const urlParams = new URLSearchParams(window.location.search);
    let name = urlParams.get('DateiName');
    name = name.replace(/\.[^/.]+$/, '');
    const text = document.getElementById("nameText")
    text.textContent = "Name: " + name;

}
function save() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('DateiName');
    const data = loadData();
    data.currentTime = seconds;
    localStorage.setItem(name, JSON.stringify(data));

}
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

    for (let i = 0; i < 25; i++) {
        const kleinesCanvas = document.createElement('canvas');
        kleinesCanvas.width = 100;  // kleine Canvas Größe (kannst du anpassen)
        kleinesCanvas.height = 100;
        kleinesCanvas.style.width = '20%'; // 5 pro Zeile
        kleinesCanvas.style.height = '20%';
        kleinesCanvas.id = "canvas_" + i.toString();
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


function leeresTile(tileWidth, tileHeight) {
    const tileData = new Uint8ClampedArray(tileWidth * tileHeight * 4); // Alles 0 = transparent

    return {
        width: tileWidth,
        height: tileHeight,
        data: tileData
    };
}