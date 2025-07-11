// Globale Variablen
let dataInDb;
let seconds = 0;                   // Sekunden-Zähler für die Spielzeit
let timerInterval = null;         // Referenz auf das setInterval-Timerobjekt
let originaleAnordnung = null;    // Originale Anordnung der Bildteile
let shuffeleddata = null;         // Derzeitige zufällige Anordnung der Bildteile
let feld = 3;                     // Spielfeldgröße (3x3 Puzzle)
let highscore = null;             // Highscore-Zeit (niedrigste Zeit)

///********************************************************************************************************/
///methoden bei laden der seite
///*******************************************************************************************************/

// Wird ausgeführt, wenn die Seite fertig geladen ist
window.addEventListener("DOMContentLoaded", async () => {
    dataInDb = await loadData();//daten aus db laden wenn seite geladen
    startTimer(); // Starte den Spielzeit-Timer
    loadName(); // Lädt und zeig Name der Datei an 
    ersetzeMitKleinenCanvases(); // Erzeuge leere Canvas-Felder für das Puzzle
    loadImage(); // Lädt das gespeicherte Bild und platziere es
    loadHighscore(); // Zeigt Highscore an
});


// Lädt den Spielstand aus db
async function loadData() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('DateiName');
    return await getDatafromDb(name);
}


// Startet den Timer beim Laden
async function startTimer() {
    if (dataInDb.currentTime != null) {
        seconds = dataInDb.currentTime; // Wiederherstellen der vorherigen Zeit
    } else {
        seconds = 0;
    }

    // Jede Sekunde die Zeit hochzählen und anzeigen
    timerInterval = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);
}


// Zeigt den Namen des Bildes an
function loadName() {
    const urlParams = new URLSearchParams(window.location.search);
    let name = urlParams.get('DateiName').replace(/\.[^/.]+$/, '');
    document.getElementById("nameText").textContent = "Name: " + name;
}


// Aktualisiert die Anzeige der Spielzeit
function updateTimerDisplay() {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const timeString = `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
    document.getElementById("gameTimer").innerText = timeString;
}


// Fügt bei einstelligen Zahlen eine führende Null hinzu (05 statt 5 usw.)
function padZero(num) {
    return num < 10 ? '0' + num : num;
}


// Lädt das Bild, teilt es auf, mischt es und platziert die Teile
function loadImage() {
    base64ToImageData(dataInDb.imageData, (imageData) => {
        originaleAnordnung = splitImageData(imageData, feld, feld);
        // Leeres Feld (für 8-Puzzle) erzeugen
        originaleAnordnung[originaleAnordnung.length - 1] = emptyTile(
            originaleAnordnung[0].width,
            originaleAnordnung[0].height
        );

        if (dataInDb.formation == null) {
            // Falls noch keine gespeicherte Anordnung, Puzzle mischen
            shuffleSave(originaleAnordnung.length);
        } else {
            // Gespeicherte Anordnung wiederherstellen
            shuffeleddata = dataInDb.formation;
        }
        placeAll(); // Alle Teile anzeigen
    });
}


// Zeigt den Highscore in userinterface an
function loadHighscore() {
    let textelemet = document.getElementById("HighscoreTime");

    if (dataInDb.highscore == null) {
        textelemet.innerText = "- : - : -";
    } else {
        const hours = Math.floor(dataInDb.highscore / 3600);
        const minutes = Math.floor((dataInDb.highscore % 3600) / 60);
        const secs = dataInDb.highscore % 60;
        textelemet.innerText = `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
    }
}

///********************************************************************************************************/
///methoden für spielinteraktion
///*******************************************************************************************************/
// Bewegt ein Puzzle-Teil beim Klicken, wenn ein benachbartes Feld leer ist (schwarzes Feld)
function moveTile(event) {
    let id = parseInt(event.srcElement.id.replace("canvas_", ""));
    let indexabove = idAbove(id);
    let indexleft = idLeft(id);
    let indexright = idRight(id);
    let indexbelow = idBelow(id);

    // Prüft alle 4 Richtungen und führt ggf. den Tausch mit dem leeren Feld aus
    for (let direction of [indexabove, indexleft, indexright, indexbelow]) {
        if (direction != null && shuffeleddata[direction] == shuffeleddata.length - 1) {
            [shuffeleddata[direction], shuffeleddata[id]] = [shuffeleddata[id], shuffeleddata[direction]];
            placeAll();

            // Überprüfen, ob Puzzle gelöst ist wenn gelöst wird highscore gespeichert 
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


// Ermittelt das Feld über dem aktuellen Index
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


// Platziert alle Teile basierend auf shuffeleddata
function placeAll() {
    for (let i = 0; i < shuffeleddata.length; i++) {
        place(i, shuffeleddata[i]);
    }
}


// Zeichnet ein Teilbild auf das zugehörige Canvas-Feld 
function place(id_canvas, id_data) {
    const tile = originaleAnordnung[id_data];
    const canvas = document.getElementById("canvas_" + id_canvas.toString());
    const ctx = canvas.getContext('2d');
    const tileImageData = new ImageData(tile.data, tile.width, tile.height);
    ctx.putImageData(tileImageData, 0, 0);
}


// Prüft, ob das Puzzle korrekt gelöst ist
function istInReihenfolge() {
    for (let i = 0; i < shuffeleddata.length - 1; i++) {
        if (shuffeleddata[i] > shuffeleddata[i + 1]) return false;
    }
    return true;
}


// Zeigt ein Gewinn-Popup an
function winAlert() {
    Swal.fire({
        title: 'You Won!',
        showCancelButton: false,
        confirmButtonText: 'OK',
    });
}

///********************************************************************************************************/
///methoden nmit buttoninteraktion
///*******************************************************************************************************/

// Speichert den aktuellen Spielstand und Highscore in db
 function save() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('DateiName');
    dataInDb.formation = shuffeleddata;
    dataInDb.currentTime = seconds;

    // Highscore aktualisieren wenn besser oder noch nicht gesetzt
    if (dataInDb.highscore != null && highscore != null && dataInDb.highscore > highscore) {
        dataInDb.highscore = highscore;
    } else if (dataInDb.highscore == null && highscore != null) {
        dataInDb.highscore = highscore;
    }
saveInDb(name, dataInDb);
}


// Spiel zurücksetzen (neu mischen)
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


// zurück auf Startseite um anders Bild zu spielen 
function changeImage() {
    Swal.fire({
        title: 'Save Game?',
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: "Don't save"
    }).then((result) => {
        if (result.isConfirmed) {
            save();
        }
        window.location.href = "start.html";
    });
}

///********************************************************************************************************/
///methoden zum spielfeldaufbau
///*******************************************************************************************************/

// Erstellt Canvas-Felder 
function ersetzeMitKleinenCanvases() {
    const puzzlefeld = document.getElementById('puzzlefeldBild');
    puzzlefeld.innerHTML = '';
    puzzlefeld.style.display = 'flex';
    puzzlefeld.style.flexWrap = 'wrap';
    puzzlefeld.style.alignContent = 'flex-start';

    for (let i = 0; i < feld * feld; i++) {
        const kleinesCanvas = document.createElement('canvas');
        const size = parseInt(500 / feld);
        kleinesCanvas.width = size;
        kleinesCanvas.height = size;
        kleinesCanvas.style.width = `${100 / feld}%`;
        kleinesCanvas.style.height = `${100 / feld}%`;
        kleinesCanvas.id = "canvas_" + i.toString();
        kleinesCanvas.addEventListener("click", moveTile);
        puzzlefeld.appendChild(kleinesCanvas);
    }
}


// Teilt Bild in kleinere Teile auf
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


// Wandelt ein base64-Bild in ImageData um um auf einzelne canvas speicher zu können 
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
        console.error('Fehler beim Laden des Base64-Bildes:', err);
    };
}


// Erzeugt ein leeres (transparentes) Teilstück
function emptyTile(tileWidth, tileHeight) {
    const tileData = new Uint8ClampedArray(tileWidth * tileHeight * 4);
    return { width: tileWidth, height: tileHeight, data: tileData };
}


// Mischt das Puzzle durch simulierte, gültige Bewegungen shuffelt so dass es immer möglich ist spiel zu lösen
function shuffleSave(arrayLength) {
    shuffeleddata = [...Array(arrayLength).keys()]; // [0, 1, 2, ..., arrayLength-1]

    function shuffleStep(i) {
        if (i >= 50) return; // Shuffle 50 mal (anpassen möglich)

        let empty = shuffeleddata.indexOf(shuffeleddata.length - 1);
        let validNeighbors = [idAbove(empty), idLeft(empty), idRight(empty), idBelow(empty)].filter(n => n != null);
        const swapIndex = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];

        // Tausche leeres Feld mit zufälligem Nachbarn
        [shuffeleddata[swapIndex], shuffeleddata[empty]] = [shuffeleddata[empty], shuffeleddata[swapIndex]];

        placeAll();
        setTimeout(() => shuffleStep(i + 1), 1);
    }

    shuffleStep(0); // Shuffle starten
}

///********************************************************************************************************/
///methoden interaktion mit server
///*******************************************************************************************************/

//data aus db laden
async function getDatafromDb(name) {
    const url = "http://127.0.0.1:3000/GETDATA?name=" + name;
    const response = await fetch(url);
    const text = await response.text();
    console.log(text);
    const object = JSON.parse(text);
    return JSON.parse(object.data);
}


//updatet daten aus db
async function saveInDb(name, data) {
    const url = "http://127.0.0.1:3000/UPDATEE?name=" + name; // requesturl die an server gesendet wird 
    const jsondata = JSON.stringify(data);
    fetch(url, { //an server senden 
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain' //daten die gesendet werden sind text und data (in body)
        },
        body: jsondata
    })
        .then(response => { //wenn antwort 
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .catch(error => { //fehler in anfrage
            console.error('There has been a problem with your fetch operation:', error);
        });
}



