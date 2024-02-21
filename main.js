import {DEFAULT_PARAMETERS} from "./params.js";
import {addZero,checkInteger} from "./util.js";
import {requestForNotification, notify} from "./notifications.js";

const parametersButton = document.querySelector('.settings__button');
const parameterInput = document.querySelectorAll('.parameter__input');
const startButton = document.querySelector('#start');
const startButtonIcon = startButton.querySelector('.icon-button__icon');
const resetButton = document.querySelector('#reset');  
const skipButton = document.querySelector('#skip');
const pomodoroModeButton = document.querySelector('#pomodoro-mode-button');
const shortBreakModeButton = document.querySelector('#short-break-mode-button');
const longBreakModeButton = document.querySelector('#long-break-mode-button');
const modal = document.querySelector('.modal');
const modalCloseButton = modal.querySelector('.modal__close-button');
const timer = document.querySelector('.timer__value');
const timerSemicircles = document.querySelectorAll('.timer__semicircle');
const pomodoroCounter = document.querySelector('.pomodoro-counter__pomodoro-count');
const pomodoroCounterImgContainer = document.querySelector('.pomodoro-counter__img-container');
const pomodoroCounterButton = document.querySelector('.pomodoro-counter__button');
const mods = document.querySelectorAll('.mode__button');
const errorMessage = modal.querySelector('.parameters__error-message');
const volumeRange = document.querySelector('.sound__range');
const audio = new Audio('./src/clock-alarm.mp3');

let parameters;

if (localStorage.getItem('parameters')) {
    parameters = JSON.parse(localStorage.getItem('parameters'));
} else {
    parameters = DEFAULT_PARAMETERS;
}

let activeButton = pomodoroModeButton;
const SECOND = 1000;
let isActive = false;
let mode = 'pomodoro';
let mins = parameters[mode].mins;
let secs = 0;
let settedTime = mins*60+secs; 
let timerID;
let pomodoroCount = 0;

const turnOnTimer = () => {
    if (!isActive) {
        isActive = true;
        timerID = setInterval(calculateTime, SECOND);
    }
    startButtonIcon.src = './src/pause-button.svg';
}

const turnOffTimer = () => {
    isActive = false;
    clearInterval(timerID);
    mins = parameters[mode].mins;
    secs = 0;
    settedTime = mins*60;
    setTime();
    startButtonIcon.src = './src/play-button.svg';
}

const stopTimer = () => {
    clearInterval(timerID);
    isActive = false;
    startButtonIcon.src = './src/play-button.svg';
}

const skipTimer = () => {
    secs = 0;
    mins = 0;
}

const onPlayButton = () => {
    (isActive) ? stopTimer() : turnOnTimer();
}


const calculateTime = () => {
    if (secs != 0) {
        secs--
        setTime();
    } else {
        if (mins != 0) {
            mins--;
            secs = 59;
            setTime();
        } else {
            isActive = false;
            if (parameters['sound']) playSound();
            clearInterval(timerID);
            if (mode == 'pomodoro') {
                pomodoroCount += 1;
                pomodoroCountChange();
                if (parameters['notifications']) notify('It`s time for break!');
                if (parameters['autoBreak']) {
                    pomodoroCount %  4 == 0 ? changeMode(longBreakModeButton) : changeMode(shortBreakModeButton);
                    turnOffTimer();
                    turnOnTimer();
                }
            } else {
                if (autoPomodoro) {
                    changeMode(pomodoroModeButton)
                    if (parameters['notifications']) notify('It`s time for work!');
                    turnOffTimer();
                    turnOnTimer();
                }
            }
        }
    }
}

const pomodoroCountChange = () => {
    pomodoroCounter.textContent = `Pomodoro: ${pomodoroCount}`;
    let pomodoroImg = document.createElement('img');
    pomodoroImg.classList.add('pomodoro-counter__pomodoro-img');

    switch(pomodoroCount) {
        case 0:
            pomodoroCounterImgContainer.innerHTML = '';
            pomodoroImg.src = './src/tomato-empty.svg';
            break;
        case 1:
            pomodoroCounterImgContainer.innerHTML = '';
            pomodoroImg.src = './src/tomato-full.svg';
            break;
        default:
            pomodoroImg.src = './src/tomato-full.svg';
    }
    pomodoroCounterImgContainer.appendChild(pomodoroImg);
}

const setTime = () => {
    timer.textContent = `${addZero(mins)}:${addZero(secs)}`;
    const remainingTime = (mins*60 + secs);
    const angle = -(remainingTime / settedTime) * 360;

    if (angle < -180) {
        timerSemicircles[2].style.display = 'none';
        timerSemicircles[0].style.transform = 'rotate(-180deg)';
        timerSemicircles[1].style.transform = `rotate(${angle}deg)`;
    } else {
        timerSemicircles[2].style.display = 'block';
        timerSemicircles[0].style.transform = `rotate(${angle}deg)`;
        timerSemicircles[1].style.transform = `rotate(${angle}deg)`;
    }
} 

const changeModeOnButton = (evt) => {
    changeMode(evt.target);
    turnOffTimer();
}

const changeMode = (newActiveButton) => {
    activeButton.classList.remove('button__active');
    activeButton = newActiveButton;
    activeButton.classList.add('button__active');
    mode = activeButton.dataset.mode;
}

const closeModal = () => {
    modal.classList.add('closed');
    window.removeEventListener('keydown', closeModalByEsc);
    modal.removeEventListener('click', closeModalByClick);
    parameterInput.forEach((parameter) => {parameter.removeEventListener('change', onParameterChange)});
    mods.forEach((mode) => {mode.removeEventListener('change', onModeChange)});
    volumeRange.addEventListener('change', volumeChange);
    audio.pause();
    audio.currentTime = 0;
}

const openModal = () => {
    modal.classList.remove('closed');
    window.addEventListener('click', closeModalByClick);
    modal.addEventListener('keydown', closeModalByEsc);
    parameterInput.forEach((parameter) => {
        parameter.addEventListener('change', onParameterChange)
        parameter.value = parameters[parameter.dataset.mode].mins
    });
    mods.forEach((mode) => {
        mode.addEventListener('change', onModeChange)
        mode.checked = parameters[mode.id];
    });
    volumeRange.addEventListener('change', volumeChange);
    volumeRange.value = parameters['volume'];
} 

const closeModalByEsc = (evt) => {
    if (evt.code == 'Escape') {
        closeModal();
    }
}

const closeModalByClick = (evt) => {
    if (evt.target == modal || evt.target == modalCloseButton) {
        closeModal()
    }
}

const onParameterChange = (evt) => {
    if (checkInteger(+evt.target.value)) {
        parameters[evt.target.dataset.mode].mins = evt.target.value;
        localStorage.setItem('parameters', JSON.stringify(parameters));
        errorMessage.classList.add('hidden');
    }
        for (let i = 0; i < parameterInput.length; i++) {
        if (!checkInteger(+parameterInput[i].value)) {
            errorMessage.classList.remove('hidden');
        }
    }
    turnOffTimer();
}

const resetPomodoroCount = () => {
    pomodoroCount = 0;
    pomodoroCountChange();
}


const onModeChange = (evt) => {
    if (evt.target.id == 'notifications') {
        if (requestForNotification()) {
            parameters[`${evt.target.id}`] = evt.target.checked;
            localStorage.setItem('parameters', JSON.stringify(parameters));
        } else {
            evt.target.checked = false;
        } 
    } else {
        parameters[`${evt.target.id}`] = evt.target.checked;
        localStorage.setItem('parameters', JSON.stringify(parameters));
    }
    turnOffTimer();
}

const playSound = () => {
    audio.volume = parameters['volume'] / 100;
    audio.play();
}

const volumeChange = (evt) => {
    console.log(evt.target.value)
    parameters['volume'] = evt.target.value;
    localStorage.setItem('parameters', JSON.stringify(parameters))
    playSound();
}




pomodoroCounterButton.addEventListener('click', resetPomodoroCount);
parametersButton.addEventListener('click', openModal);
startButton.addEventListener('click', onPlayButton);
skipButton.addEventListener('click', skipTimer);
resetButton.addEventListener('click', turnOffTimer);
pomodoroModeButton.addEventListener('click', changeModeOnButton);
shortBreakModeButton.addEventListener('click', changeModeOnButton);
longBreakModeButton.addEventListener('click', changeModeOnButton);



setTime();
pomodoroCountChange();
