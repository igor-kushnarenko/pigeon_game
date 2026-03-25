export function initAudio(state) {
  state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

export function playFootstep(state) {
  if (!state.audioContext) return;

  const now = state.audioContext.currentTime;
  const osc = state.audioContext.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(65, now);

  const gain = state.audioContext.createGain();
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  const filter = state.audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 420;

  osc.connect(filter).connect(gain).connect(state.audioContext.destination);
  osc.start(now);
  osc.stop(now + 0.2);
}

export function playEatSound(state) {
  if (!state.audioContext) return;

  const now = state.audioContext.currentTime;
  const osc1 = state.audioContext.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(1200, now);

  const gain1 = state.audioContext.createGain();
  gain1.gain.setValueAtTime(0.25, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  const osc2 = state.audioContext.createOscillator();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(180, now);

  const gain2 = state.audioContext.createGain();
  gain2.gain.setValueAtTime(0.18, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc1.connect(gain1).connect(state.audioContext.destination);
  osc2.connect(gain2).connect(state.audioContext.destination);
  osc1.start(now);
  osc1.stop(now + 0.15);
  osc2.start(now);
  osc2.stop(now + 0.1);
}
