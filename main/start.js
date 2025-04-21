// ⬛ Unsichtbares Datei-Input-Feld erstellen
const fileInput = document.createElement('input');

fileInput.type = 'file';
fileInput.accept = 'image/*'; // Nur Bilddateien erlauben
fileInput.style.display = 'none';
document.body.appendChild(fileInput); // ins DOM einfügen

// ⬛ Den Import-Button aus dem HTML greifen
const importButton = document.querySelector('.importbutton .runderbutton');
document.addEventListener('DOMContentLoaded', () => {
    // Wird ausgeführt, wenn das HTML komplett geladen ist
    updateTableFromLocalStorage();
});


// ⬛ Öffnet das Datei-Auswahlfenster beim Klick auf den Button
importButton.addEventListener('click', () => {
    fileInput.click();
});

//speichert datei in lokal storage
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        console.warn("Datei ist kein Bild.");
        return;
    }
    let reader = new FileReader();
    reader.onload = (event) => {
        const imageName = fileInput.files[0].name
        const imageData = event.target.result;
        const jsondata = {
            imageData: imageData,
            highscore: null,
            currentTime: null
        };
        const jsonString = JSON.stringify(jsondata);
        localStorage.setItem(imageName, jsonString);
        fileInput.value = ''; // ← hier
        updateTableFromLocalStorage();
    };
    reader.readAsDataURL(file);
});


function updateTableFromLocalStorage() {
    const table = document.getElementById('HighscoreTabelle');

    // Lösche alle bisherigen Datenzeilen (alles außer Header)
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Hole alle Keys aus dem localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const jsonString = localStorage.getItem(key);
        const data = JSON.parse(jsonString);

        // Falls du nur Bilddaten willst, kannst du prüfen ob value mit "data:image/" anfängt

        const newRow = table.insertRow();

        const nameCell = newRow.insertCell();
        const highscoreCell = newRow.insertCell();
        const timeCell = newRow.insertCell();

        nameCell.textContent = key;
        if (data.highscore != null) {
            highscoreCell.textContent = data.highscore;
        }
        else {


            highscoreCell.textContent = "-"; // Platzhalter
        }
        if (data.currentTime != null) {
            timeCell.textContent = data.currentTime;
        }
        else {
            timeCell.textContent = "-"; // Platzhalter
        }
        newRow.addEventListener('click', selectRow);

    }
}


const table = document.getElementById('HighscoreTabelle');
let selectedValue = null;

function selectRow(event) {
    for (let j = 1; j < table.rows.length; j++) {
        table.rows[j].classList.remove('selected');
    }

    const clickedRow = event.currentTarget;
    clickedRow.classList.add('selected');

    selectedValue = clickedRow.cells[0].innerText;
    console.log('Gespeichert:', selectedValue);
}
function changeSite() {
    if (selectedValue == null) {
        window.alert("No picture selected ");
        return;
    }

    window.location.href = `main.html?DateiName=${encodeURIComponent(selectedValue)}`;
}
