// import * as nn from "https://cdn.jsdelivr.net/gh/netizenorg/netnet-standard-library/build/nn.min.js";
// import * as Tone from "https://tonejs.github.io/build/Tone.js";
/* global nn, Tone */

const enableDebug = false;
const gamepads = {};

function printf (out) {
  if (enableDebug) {
    console.log(out)
  }
}
function gamepadHandler(event, connected) {
  const gamepad = event.gamepad;
  printf(gamepad)
  // Note:
  // gamepad === navigator.getGamepads()[gamepad.index]
  if (connected) {
    gamepads[gamepad.index] = gamepad;
  } else {
    delete gamepads[gamepad.index];
  }
  printf(gamepads)
}

window.addEventListener(
  "gamepadconnected",
  (e) => {
    gamepadHandler(e, true);
    Tone.start();
  },
  false,
);
window.addEventListener(
  "gamepaddisconnected",
  (e) => {
    gamepadHandler(e, false);
  },
  false,
);
// ========

/* Initialize effect(s) */

const gain = new Tone.Gain(0.5).toDestination();

const pitchShift = new Tone.PitchShift({
  wet: 1,
  pitch: 12
});

/* Initialize sample players */
const samplePaths = [
  "../samples/1984.mp3",           // a
  "../samples/normOrSo.mp3",       // b
  "../samples/tucker.mp3",         // x
  "../samples/Olimar.mp3",         // y
  "../samples/but_then.mp3",       // LB
  "../samples/what_is_a_dawg.mp3",  // RB
  "../samples/silent.mp3",
  "../samples/silent.mp3",
  "../samples/this-is-called-what.mp3",
  "../samples/perhaps-what-is-this.mp3",
  "../samples/whole-ocean.mp3"
]

let samplePlayers = []

samplePaths.forEach((path) => {
  samplePlayers.push(
    new Tone.Player(path).chain(pitchShift, gain)
  )
})

/*
const synth = new Tone.Synth().toDestination()

const noteMap = [
  {note: "C4", pressed: false},   // a
  {note: "D#4", pressed: false},  // b
  {note: "F#4", pressed: false},  // x
  {note: "E4", pressed: false}    // y
]
*/

let pollingID = 0;

function stopSample (sampleID) {
  samplePlayers[sampleID].loop = false;
  samplePlayers[sampleID].stop();
}

function playSample (sampleID, loop) {
  // sampler.triggerAttackRelease(notes[noteInd], 5)
  samplePlayers[sampleID].loop = loop;
  samplePlayers[sampleID].start();
  // synth.triggerAttackRelease([noteInd], '8n')
 }

function poll () {
  const liveGamepads = navigator.getGamepads()
  if (liveGamepads[0]) {
    const gamepad = liveGamepads[0]

    const buttons = gamepad.buttons
    const allAxes = gamepad.axes;  // Joystick axes
    const leftTrig = gamepad.buttons[6].value;  // Left trigger
    const rightTrig = gamepad.buttons[7].value;  // Right trigger
    /* 
    Axes array layout:
    [LeftHoriz, LeftVert, RightHoriz, RightVert]

    Stick values:
        -1
    -1   0   1
         1
    */

    printf(allAxes)
    printf(leftTrig)  // Left trigger value
    printf(rightTrig)  // Right trigger value

    document.getElementById("khaled").style.opacity = rightTrig
    // pitchShift.pitch = nn.map(leftTrig, 0, 1, 0, 4)
    pitchShift.pitch = nn.map(allAxes[1], 1, -1, -3, 3)
    gain.gain.value = nn.map(allAxes[3], 1, -1, 0.2, 2)
    printf(pitchShift.pitch)
    // Play samples on face button presses
    for (let i = 0; i < samplePlayers.length; i++) {
      if (buttons[i].value == 1) {
        if (buttons[18].value == 1) {
          stopSample(i);
        } else {
          playSample(i, buttons[17].value == 1)
        }
      }
    }

  }
}

function startPolling () {
  pollingID = setInterval(poll, 100);  // call poll() every 100 milliseconds
}

function stopPolling () {
  clearInterval(pollingID);
}

nn.get('#startButton').on('click', startPolling)
nn.get('#stopButton').on('click', stopPolling)
nn.get('#enableTone').on('click', () => {Tone.start();})
