let seconds = 0;
let timerInterval = null;

function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeString = `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    document.getElementById("gameTimer").innerText = timeString;
}

window.addEventListener("DOMContentLoaded", () => {
    startTimer();
});
