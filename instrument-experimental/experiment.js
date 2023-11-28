// import * as nn from "https://cdn.jsdelivr.net/gh/netizenorg/netnet-standard-library/build/nn.min.js";
// import * as Tone from "https://tonejs.github.io/build/Tone.js";
/* global nn, Tone */


const enableDebug = true;
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
  pitch: 0
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
const synth = new Tone.PolySynth().chain(pitchShift, gain)

let pollingID = 0;

function stopSample (sampleID) {
  samplePlayers[sampleID].loop = false;
  samplePlayers[sampleID].stop();
}

function playSample (sampleID, loop) {
  // sampler.triggerAttackRelease(notes[noteInd], 5)
  if (sampleID >= samplePlayers.length) {
    printf("no sample to play");
    return;
  }
  const player = samplePlayers[sampleID]
  player.loop = loop;

  if (player.state == "stopped") {
    player.start();
  }
  // synth.triggerAttackRelease([noteInd], '8n')
 }

const listener = new GamepadListener();

listener.on('gamepad:connected', event => {
  const {
    index, // Gamepad index: Number [0-3].
    gamepad, // Native Gamepad object.
  } = event.detail;
  console.log(index, gamepad)
});

let controllerMap = {
  buttons: [
    {index:  0, pressed: false, value: 0},
    {index:  1, pressed: false, value: 0},
    {index:  2, pressed: false, value: 0},
    {index:  3, pressed: false, value: 0},
    {index:  4, pressed: false, value: 0},
    {index:  5, pressed: false, value: 0},
    {index:  6, pressed: false, value: 0},
    {index:  7, pressed: false, value: 0},
    {index:  8, pressed: false, value: 0},
    {index:  9, pressed: false, value: 0},
    {index: 10, pressed: false, value: 0},
    {index: 11, pressed: false, value: 0},
    {index: 12, pressed: false, value: 0},
    {index: 13, pressed: false, value: 0},
    {index: 14, pressed: false, value: 0},
    {index: 15, pressed: false, value: 0},
    {index: 16, pressed: false, value: 0},
    {index: 17, pressed: false, value: 0},
    {index: 18, pressed: false, value: 0}
  ],
  axes: [
    {value: 0},
    {value: 0},
    {value: 0},
    {value: 0}
  ]
}

listener.on('gamepad:button', event => {
  const {
      index,// Gamepad index: Number [0-3].
      button, // Button index: Number [0-N].
      value, // Current value: Number between 0 and 1. Float in analog mode, integer otherwise.
      pressed, // Native GamepadButton pressed value: Boolean.
      gamepad, // Native Gamepad object
  } = event.detail;
  controllerMap.buttons[button].pressed = pressed
  controllerMap.buttons[button].value = value
  const sustain = controllerMap.buttons[18].pressed
  if (pressed && button != 18) {
    printf(`you pressed button ${button}!`)
    playSample(button, sustain)
  }
});

/* 
  Axes:
    0: LHoriz
    1: LVert
    2: RHoriz
    3: RVert
*/
listener.on('gamepad:0:axis:1', event => { 
  const {
      index,// Gamepad index: Number [0-3].
      axis, // Axis index: Number [0-N].
      value, // Current value: Number between -1 and 1. Float in analog mode, integer otherwise.
      gamepad, // Native Gamepad object
  } = event.detail;
  controllerMap.axes[axis].value = value;
  printf(`axis ${axis} value = ${value}`)
  pitchShift.pitch = nn.map(value, 1, -1, -3, 3)
});

listener.on('gamepad:0:axis:3', event => { 
  const {
      index,// Gamepad index: Number [0-3].
      axis, // Axis index: Number [0-N].
      value, // Current value: Number between -1 and 1. Float in analog mode, integer otherwise.
      gamepad, // Native Gamepad object
  } = event.detail;
  controllerMap.axes[axis].value = value;
  printf(`axis ${axis} value = ${value}`)
  gain.gain.value = nn.map(value, 1, -1, 0.2, 2)
});

function startPolling () {
  listener.start()
}
function stopPolling () {
  listener.stop();
}


/* Event listeners */
nn.get('#startButton').on('click', startPolling)
nn.get('#stopButton').on('click', stopPolling)
nn.get('#enableTone').on('click', () => {Tone.start();})

// const noteCount = 128;  // Change this (allow input) to change melody length
let scale_pattern = [2,2,3,2,3]  // Pentatonic scale degrees
let root = 'A#3'
let sequence = createSequence(root, scale_pattern, nn.get("#noteCount").value)
nn.get("#randomize").on("click", () => {randomizeSequence(root, scale_pattern, nn.get("#noteCount").value)})
nn.get("#play-pause").on("input", toggleScale)
nn.get("#tempo").on("input", () => {
  let newTempo = nn.get("#tempo").value;
  Tone.Transport.bpm.value = newTempo
  printf(`tempo changed to ${newTempo}`)})
nn.get("#tempoReset").on("click", () => {
  nn.get("#tempo").value = 90;
  Tone.Transport.bpm.value = 90;
})

Tone.Transport.bpm.value = 90
Tone.Transport.scheduleRepeat(time => play(time, synth), '16n')