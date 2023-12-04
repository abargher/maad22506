const keyMap = {
  // maps key names to half-step offset values
  "keyC"  : "C",
  "keyG"  : "G",
  "keyD"  : "D",
  "keyA"  : "A",
  "keyE"  : "E",
  "keyB"  : "B",
  "keyGb" : "F#",
  "keyDb" : "C#",
  "keyAb" : "G#",
  "keyEb" : "D#",
  "keyBb" : "A#",
  "keyF"  : "F",
}


function createScale(key, pattern) {
  let root = keyMap[key] + nn.get("#octaves").value.slice(-1); 
  const scale = [root]
  let note = root.slice(0, -1) // ex: 'C' from 'C4'
  let octave = parseInt(root.slice(-1)) // ex: 4 from 'C4'
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  for (const step of pattern) {
    const noteIndex = notes.indexOf(note)
    const nextNoteIndex = (noteIndex + step) % notes.length
    if (nextNoteIndex < noteIndex) octave += 1
    note = notes[nextNoteIndex]
    scale.push(note + octave)
  }

  console.log(scale.length)
  return scale
}

const scaleState = {
  step: 0,
  sequence: []
}


/*  Create global note lengths */
const lengthMap = {
  '2n': 1,
  '4n': 3,
  '8n': 3,
  '16n': 3,
}
const noteLengths = []
for (const [note, repeats] of Object.entries(lengthMap)) {
  for (let i = 0; i < repeats; i++) {
    noteLengths.push(note)
  }
}

function getRandomNoteLength() {
  return nn.random(noteLengths);
}

// function createSequence (root, scale_pattern, noteCount) {
//   const notes = createScale (root, scale_pattern)
//   // const lens = ['2n', '4n', '8n', '16n']
//   for (let i = 0; i < noteCount; i++) {
//     const obj = {}
//     obj.note = nn.random(notes)
//     // obj.len = nn.random(lens)
//     obj.len = getRandomNoteLength()
//     obj.play = nn.random() < 0.7
//     scaleState.sequence.push(obj)
//   }
//   console.log(scaleState.sequence)
// }

function randomizeSequence (noteCount, arpeggChance) {
  scaleState.sequence = [] // clear the last sequence
  if (Tone.Transport.state === 'started') Tone.Transport.stop()
  generateMelody(noteCount, arpeggChance);
  if (nn.get('#play-pause').checked) Tone.Transport.start()
}


function toggleScale() {
  if (Tone.Transport.state === 'started') {
    Tone.Transport.stop()
  } else {
    Tone.Transport.start()
  }
}

function getNote (degree, octaveOffset, scale) {
  let note = scale[degree % scale.length]
  let pitch = note.slice(0,-1);
  let octave = parseInt(nn.get("#octaves").value.slice(-1)) + octaveOffset
  return pitch + `${octave}`
}

function play (time, instr, scale) {
  const index = scaleState.step % scaleState.sequence.length
  const note = scaleState.sequence[index]
  if (note.play) {
    pitch = getNote(note.degree, note.octaveOffset, scale);
    instr.triggerAttackRelease(pitch, note.duration, time);
  }
  scaleState.step++
}

function randomNote() {
  return {
    degree : nn.randomInt(0, 7),  // scale degree = note played
    octaveOffset : nn.randomInt(0, 1),  // add to base octave
    duration : getRandomNoteLength(),  // e.g. '2n', '8n', etc
    play : Boolean(nn.randomInt(0, 1)),  // is this a rest?
  };
}

function generateMelody (noteCount, arpeggChance) {
  const melody = [];
  for (let i = 0; i < noteCount; i++){
    if (nn.random() < arpeggChance) {
      let start = nn.randomInt(0, 7);
      let octave = nn.randomInt(0, 1);
      let len = getRandomNoteLength();
      for (let j = 0; j < 3; j++) {
        melody.push({
          degree : (start + j) % 8,
          octaveOffset : octave,
          duration : len,
          play : true,
        });
      }
    } else {
      melody.push(randomNote());
    }
  }
  scaleState.sequence = melody.slice(0, noteCount);
}


