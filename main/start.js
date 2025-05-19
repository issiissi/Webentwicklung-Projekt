//  Unsichtbares Datei-Input-Feld erstellen (für Bildauswahl)
const fileInput = document.createElement('input');
fileInput.type = 'file';                  // Typ ist Datei
fileInput.accept = 'image/*';             // Nur Bilddateien zulassen
fileInput.style.display = 'none';         // Unsichtbar machen
document.body.appendChild(fileInput);     // In den Body einfügen

//  Den Import-Button im HTML-Dokument holen
const importButton = document.querySelector('.importbutton .runderbutton');

//  Funktion wird ausgeführt, sobald das DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', () => {
    updateTableFromLocalStorage();        // Tabelle mit gespeicherten Bilddaten aktualisieren
});

//  Beim Klick auf den Button wird das Datei-Auswahlfenster geöffnet
importButton.addEventListener('click', () => {
    fileInput.click();                    // Klick auf das versteckte Input-Feld auslösen
});

// Wenn der Benutzer ein Bild auswählt, wird dieses eingelesen und im LocalStorage gespeichert
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];      // Erstes ausgewähltes File holen
    if (!file) return;                    // Wenn keine Datei gewählt wurde, abbrechen

    // Sicherstellen, dass es sich um eine Bilddatei handelt
    if (!file.type.startsWith('image/')) {
        console.warn("Datei ist kein Bild.");
        return;
    }

    // FileReader wird benutzt, um das Bild als Base64 zu laden
    let reader = new FileReader();
    reader.onload = (event) => {
        const imageName = fileInput.files[0].name;  // Dateiname (inkl. Endung)
        const imageData = event.target.result;      // Base64-Daten

        // JSON-Struktur (javscript objektnotation objekt wird in text gespeichert das man laden kann dass es genau so wieder erstellt wird wie es im string gespeichert ist) zum Speichern vorbereiten
        const jsondata = {
            imageData: imageData,
            highscore: null,
            currentTime: null,
            formation: null
        };

        // Daten in JSON umwandeln und im LocalStorage speichern
        const jsonString = JSON.stringify(jsondata);
        localStorage.setItem(imageName, jsonString);

        fileInput.value = ''; // Reset des Input-Feldes (damit man die gleiche Datei erneut auswählen könnte)

        // Tabelle mit neuen Daten aktualisieren
        updateTableFromLocalStorage();
    };

    reader.readAsDataURL(file);  // Datei als Base64 einlesen
});


// Tabelle mit den gespeicherten Bildern und deren Daten aktualisieren
function updateTableFromLocalStorage() {
    const table = document.getElementById('HighscoreTabelle');

    // Alle alten Datenzeilen (außer der Kopfzeile) löschen
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Durch alle gespeicherten Items im localStorage iterieren
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);                   // Schlüssel (Dateiname)
        const jsonString = localStorage.getItem(key);      // JSON-String auslesen
        const data = JSON.parse(jsonString);               // In Objekt umwandeln

        const newRow = table.insertRow();                  // Neue Zeile in die Tabelle einfügen

        // Zellen für Name, Highscore und aktuelle Zeit hinzufügen
        const nameCell = newRow.insertCell();
        const highscoreCell = newRow.insertCell();
        const timeCell = newRow.insertCell();

        nameCell.textContent = key;                        // Dateiname anzeigen

        // Highscore anzeigen (oder "-" wenn nicht vorhanden)
        if (data.highscore != null) {
            highscoreCell.textContent = data.highscore;
        } else {
            highscoreCell.textContent = "-";
        }

        // Aktuelle Zeit anzeigen (oder "-" wenn nicht vorhanden)
        if (data.currentTime != null) {
            timeCell.textContent = data.currentTime;
        } else {
            timeCell.textContent = "-";
        }

        // Wenn die Zeile angeklickt wird, wird sie markiert
        newRow.addEventListener('click', selectRow);
    }
}

//  Tabelle definieren und ausgewählten Wert speichern
const table = document.getElementById('HighscoreTabelle');
let selectedValue = null;

//  markiert die geklickte Zeile und speichert den Namen
function selectRow(event) {
    // Alle bisherigen Markierungen entfernen
    for (let j = 1; j < table.rows.length; j++) {
        table.rows[j].classList.remove('selected');
    }

    // Aktuelle Zeile markieren
    const clickedRow = event.currentTarget;
    clickedRow.classList.add('selected');

    // Namen der Bilddatei merken
    selectedValue = clickedRow.cells[0].innerText;
    console.log('Gespeichert:', selectedValue); // Für Debugzwecke
}

// wechsel auf andere Seite
function changeSite() {
    // Wenn keine Auswahl getroffen wurde, Hinweis anzeigen
    if (selectedValue == null) {
        window.alert("No picture selected ");
        return;
    }

    // weiterleitung mit parameter parameter gibt an welches bild aus speicher geladen werden muss 
    window.location.href = `main.html?DateiName=${encodeURIComponent(selectedValue)}`;
}
async function requestTextWithGET(url) {
  const response = await fetch(url);
  console.log('Response:', response); // vollständiges Response-Objekt
  const text = await response.text();
  console.log('Response-Text:', text); // Text aus dem Response-Body
}

requestTextWithGET('http://127.0.0.1:3000/');
console.log('Zwischenzeitlich weiterarbeiten...');
