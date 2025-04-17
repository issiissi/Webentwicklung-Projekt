// ⬛ Unsichtbares Datei-Input-Feld erstellen
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*'; // Nur Bilddateien erlauben
fileInput.style.display = 'none';
document.body.appendChild(fileInput); // ins DOM einfügen

// ⬛ Den Import-Button aus dem HTML greifen
const importButton = document.querySelector('.importbutton .runderbutton');

// ⬛ Klick-Event hinzufügen: Öffnet das Datei-Dialogfenster
importButton.addEventListener('click', () => {
    fileInput.click();
});

// ⬛ Optional: Wenn Datei ausgewählt wurde, etwas machen (z. B. Name anzeigen)
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        alert('Bild ausgewählt: ' + fileInput.files[0].name);
    }
});
