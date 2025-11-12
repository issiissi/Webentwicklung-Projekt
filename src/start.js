// ****************************************************************************************************
// Hidden File Input Setup
// ****************************************************************************************************
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

// ****************************************************************************************************
// Table and Button Setup
// ****************************************************************************************************
const table = document.getElementById('HighscoreTabelle');
let selectedValue = null;

const importButton = document.querySelector('.importbutton .runderbutton');

// ****************************************************************************************************
// User Interaction
// ****************************************************************************************************
document.addEventListener('DOMContentLoaded', async () => {
    await updateTablefromDB();
});

importButton.addEventListener('click', () => {
    fileInput.click();
});

function selectRow(event) {
    // Remove existing selection
    for (let j = 1; j < table.rows.length; j++) {
        table.rows[j].classList.remove('selected');
    }

    // Highlight selected row
    const clickedRow = event.currentTarget;
    clickedRow.classList.add('selected');

    // Store selected file name
    selectedValue = clickedRow.cells[0].innerText;
    console.log('Saved selection:', selectedValue);
}

function changeSite() {
    if (selectedValue == null) {
        window.alert("No picture selected");
        return;
    }

    // Redirect to puzzle page with file name parameter
    window.location.href = `main.html?DateiName=${encodeURIComponent(selectedValue)}`;
}

// ****************************************************************************************************
// Image Upload
// ****************************************************************************************************
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        console.warn("Selected file is not an image.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        let imageName = file.name;
        const imageData = event.target.result;

        const jsondata = {
            imageData,
            highscore: null,
            currentTime: null,
            formation: null
        };

        const jsonString = JSON.stringify(jsondata);
        imageName = imageName.substring(0, imageName.lastIndexOf('.')) || imageName;

        await addToDb(imageName, jsonString);
        fileInput.value = '';

        await delay(500);
        await updateTablefromDB();
    };

    reader.readAsDataURL(file);
});

// ****************************************************************************************************
// Table Update
// ****************************************************************************************************
async function updateTablefromDB() {
    const table = document.getElementById('HighscoreTabelle');

    // Remove old rows (keep header)
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    const names = await getNamesFromDB();

    for (const name of names) {
        const data = await getData(name);
        const newRow = table.insertRow();

        const nameCell = newRow.insertCell();
        const highscoreCell = newRow.insertCell();
        const timeCell = newRow.insertCell();

        nameCell.textContent = name;
        highscoreCell.textContent = data.highscore ?? '-';
        timeCell.textContent = data.currentTime ?? '-';

        newRow.addEventListener('click', selectRow);
    }
}

// ****************************************************************************************************
// Server Interaction
// ****************************************************************************************************
async function addToDb(projectName, data) {
    const url = `http://127.0.0.1:3000/ADDIMAGE?name=${projectName}`;

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: data
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.text();
        })
        .catch(error => {
            console.error('Error during fetch operation:', error);
        });
}

async function getNamesFromDB() {
    const url = "http://127.0.0.1:3000/GETNAMES";
    const response = await fetch(url);
    const text = await response.text();
    console.log(text);
    return JSON.parse(text);
}

async function getData(name) {
    const url = `http://127.0.0.1:3000/GETDATA?name=${name}`;
    const response = await fetch(url);
    const text = await response.text();
    const object = JSON.parse(text);
    return JSON.parse(object.data);
}

// ****************************************************************************************************
// Utility
// ****************************************************************************************************
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
