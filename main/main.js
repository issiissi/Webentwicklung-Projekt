let seconds = 0;
let timerInterval = null;

function startTimer() {
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
});
