let seconds = 0;
let timerInterval = null;

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
    loadImage();
    loadName();
});

function loadImage() {

    const data = loadData();

    const imgElement = document.querySelector('#puzzlefeldBild img');
    imgElement.src = data.imageData;

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
function reset(){
   Swal.fire({
    title: 'Reset Game?',
    showCancelButton: true,
    confirmButtonText: 'Reset',
    cancelButtonText: "Don't Reset"
}).then((result) => {
    if (result.isConfirmed) {
        seconds=0;
        save();
    } 
});

}