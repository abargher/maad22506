/* global nn, Tone */

const gamepads = {};

function gamepadHandler(event, connected) {
  const gamepad = event.gamepad;
  console.log(gamepad)
  // Note:
  // gamepad === navigator.getGamepads()[gamepad.index]
  if (connected) {
    gamepads[gamepad.index] = gamepad;
  } else {
    delete gamepads[gamepad.index];
  }
  console.log(gamepads)
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
    new Tone.Player(path).toDestination()
  )
})

const synth = new Tone.Synth().toDestination()

const noteMap = [
  {note: "C4", pressed: false},   // a
  {note: "D#4", pressed: false},  // b
  {note: "F#4", pressed: false},  // x
  {note: "E4", pressed: false}    // y
]

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

    console.log(allAxes)
    console.log(leftTrig)  // Left trigger value
    console.log(rightTrig)  // Right trigger value

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
    document.getElementById("khaled").style.opacity = rightTrig

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
