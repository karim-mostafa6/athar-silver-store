// Web Audio API Luxury Chime Generator for Athar Silver Store
// 100% Client-side, zero latency, no external mp3 assets needed

export const playRoyalOrderChime = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    // Harmonic notes for a royal luxury chime: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz), E6 (1318Hz)
    const chords = [
      { freq: 523.25, time: 0, duration: 1.0, gain: 0.25 },
      { freq: 659.25, time: 0.12, duration: 1.1, gain: 0.23 },
      { freq: 783.99, time: 0.24, duration: 1.2, gain: 0.22 },
      { freq: 1046.5, time: 0.38, duration: 1.6, gain: 0.28 },
      { freq: 1318.51, time: 0.52, duration: 1.8, gain: 0.25 },
    ];

    chords.forEach(({ freq, time, duration, gain: maxGain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + time);

      gainNode.gain.setValueAtTime(0, now + time);
      gainNode.gain.linearRampToValueAtTime(maxGain, now + time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  } catch (err) {
    console.warn("Unable to play sound alert:", err);
  }
};
