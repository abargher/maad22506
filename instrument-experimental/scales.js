function createScale(root, pattern) {
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

  return scale
}

const scaleState = {
  step: 0,
  sequence: []
}

function createSequence (root, scale_pattern, noteCount) {
  const notes = createScale (root, scale_pattern)
  const lens = ['4n', '8n', '16n']  
  for (let i = 0; i < noteCount; i++) {
    const obj = {}
    obj.note = nn.random(notes)
    obj.len = nn.random(lens)
    obj.play = nn.random() < 0.7
    scaleState.sequence.push(obj)
  }
  console.log(scaleState.sequence)
}

function randomizeSequence (root, pattern, noteCount) {
  scaleState.sequence = [] // clear the last sequence
  if (Tone.Transport.state === 'started') Tone.Transport.stop()
  createSequence(root, pattern, noteCount)
  if (nn.get('#play-pause').checked) Tone.Transport.start()
}


function toggleScale() {
  if (Tone.Transport.state === 'started') {
    Tone.Transport.stop()
  } else {
    Tone.Transport.start()
  }
}

function play (time, instr) {
  const index = scaleState.step % scaleState.sequence.length
  const obj = scaleState.sequence[index]
  if (obj.play === true) {
   instr.triggerAttackRelease(obj.note, obj.len, time) 
  }
  scaleState.step++
}