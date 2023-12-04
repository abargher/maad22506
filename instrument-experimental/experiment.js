// import * as nn from "https://cdn.jsdelivr.net/gh/netizenorg/netnet-standard-library/build/nn.min.js";
// import * as Tone from "https://tonejs.github.io/build/Tone.js";
/* global nn, Tone */

function printf (out) {
  if (enableDebug) {
    console.log(out)
  }
}
/* Global constants */
const defaultTempo = 90;
const defaultNoteCount = 16;
const defaultVolume = 0.5;  // expressed as a gain value
const defaultArpegg = 0.1;
let scale_pattern = [2,2,3,2,3]  // Pentatonic scale degrees

/* Global variables */
let baseVolume = defaultVolume;
const enableDebug = true;

const effectState = {
  tempo : defaultTempo,
  reverb : 0,
  volume : defaultVolume,
  pitch : 0,
  scale : createScale("keyC", scale_pattern),
  arpegg : defaultArpegg,
};

/* Initialize effect(s) */

const gain = new Tone.Gain(0.5).toDestination();

const pitchShift = new Tone.PitchShift({
  wet: 1,
  pitch: 0
});
const synth = new Tone.PolySynth().chain(pitchShift, gain)
printf(synth.options.envelope)
const defaultAttack = synth.options.envelope.attack;
const defaultRelease = synth.options.envelope.release;
const defaultDecay = synth.options.envelope.decay;

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
  if (pressed && button != 18) {
    printf(`you pressed button ${button}!`)
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
  printf(`base volume is ${baseVolume}`)
  // gain.gain.value = baseVolume + nn.map(value, 1, -1, 0.2, 2)
  gain.gain.value = baseVolume + nn.map(value, 1, -1, -0.8, 0.8)
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

let root = nn.get("#keys").value
generateMelody(nn.get("#noteCount").value, nn.get("#arpegg").value)

nn.get("#randomize").on("click", () => {
  randomizeSequence(nn.get("#noteCount").value, nn.get("#arpegg").value);
});

nn.get("#play-pause").on("input", toggleScale)


// tempo controls
nn.get("#tempo").on("input", () => {
  let newTempo = Number(nn.get("#tempo").value);
  Tone.Transport.bpm.value = newTempo
  printf(`tempo changed to ${newTempo}`)})

nn.get("#tempoReset").on("click", () => {
  nn.get("#tempo").value = defaultTempo;
  Tone.Transport.bpm.value = defaultTempo;
  printf(`tempo reset to default value (${defaultTempo} bpm)`);
})

// volume controls
nn.get("#volume").on("input", () => {
  let newVolume = Number(nn.get("#volume").value);
  baseVolume = newVolume;
  gain.gain.value = baseVolume;
  printf(`volume set to ${newVolume}`);
})

nn.get("#volumeReset").on("click", () => {
  gain.gain.value = defaultVolume
  nn.get("#volume").value = defaultVolume
  printf("volume reset to default")
})

// melody length controls
nn.get("#noteCountReset").on("click", () => {
  nn.get("#noteCount").value = defaultNoteCount;
  printf("melody length reset to default (16)");
})

nn.get("#arpeggReset").on("click", () => {
  nn.get("#arpegg").value = defaultArpegg;
  printf(`arpeggio percentage reset to default (${defaultArpegg})`);
})

// key select controls
nn.get("#keys").on("input", () => {
  let newKey = nn.get("#keys").value;
  effectState.scale = createScale(newKey, scale_pattern)
  printf(`Now the key is ${newKey}`);
})

Tone.Transport.bpm.value = defaultTempo
Tone.Transport.scheduleRepeat(time => play(time, synth, effectState.scale), '16n')