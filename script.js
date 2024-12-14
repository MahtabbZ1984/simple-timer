let totalSeconds = 0;
let isPaused = false;
let worker;

// Initialize the worker
if (window.Worker) {
    worker = new Worker('timer-worker.js');
    worker.onmessage = function (event) {
        if (event.data === 'tick') {
            updateCountdown();
        }
    };
} else {
    console.error('Web Workers are not supported in this browser.');
}

const alarm = document.getElementById('alarm');

function startCountdown() {
    changeButtonState('Stop');
    console.log('Start button clicked');
    const countdownInput = document.getElementById('countdown');
    countdownInput.addEventListener('focus', function () {
        alarm.pause();
        console.log('User clicked to edit the input field');
    });
    totalSeconds = parseInt(countdownInput.value, 10);

    if (isNaN(totalSeconds) || totalSeconds <= 0) {
        alert('Please enter a valid countdown time greater than 0.');
        return;
    }

    worker.postMessage('start');
    document.getElementById('countdown').readOnly = true;
    document.getElementById('StartBtn').disabled = true;
}

function stopResumeTimer() {
    if (isPaused) {
        resumeTimer();
    } else {
        stopTimer();
    }
}

function stopTimer() {
    if (totalSeconds === 0) {
        document.getElementById('countdown').readOnly = false;
    }
    worker.postMessage('stop');
    alarm.pause();
    if (totalSeconds > 0) {
        changeButtonState('Resume');
    }
}

function resumeTimer() {
    changeButtonState('Stop');
    worker.postMessage('start');
}

function changeButtonState(newState) {
    const button = document.getElementById("stopResumeBtn");

    if (button) {
        button.innerText = newState;
        isPaused = newState === 'Resume';
    } else {
        console.error("Button element not found");
    }
}

function resetTimer() {
    changeButtonState('Stop');
    worker.postMessage('stop');
    totalSeconds = 0;
    alarm.currentTime = 0;
    alarm.pause();
    document.getElementById('timer').innerText = '00:00:00';
    document.getElementById('countdown').readOnly = false;
    document.getElementById("StartBtn").disabled = false;
}

function updateCountdown() {
    console.log('Updating countdown');
    console.log('Total Seconds:', totalSeconds);

    if (totalSeconds <= 0) {
        playAlarm();
        worker.postMessage('stop');
        return;
    }

    totalSeconds--;
    const hours = totalSeconds / 3600 | 0;
    const minutes = (totalSeconds % 3600) / 60 | 0;
    const remainingSeconds = totalSeconds % 60 | 0;

    console.log('Formatted Time:', `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`);
    document.getElementById('timer').innerText = `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;

    if (totalSeconds === 0) {
        document.getElementById('countdown').readOnly = false;
    }
}

function pad(value) {
    return value < 10 ? `0${value}` : value;
}

function playAlarm() {
    const alarm = document.getElementById('alarm');
    alarm.play();
}
