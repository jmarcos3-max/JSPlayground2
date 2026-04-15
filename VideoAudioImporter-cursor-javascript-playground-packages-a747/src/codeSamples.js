import { gettingStartedSamples } from "./gettingStartedSamples.js";

const gs = gettingStartedSamples;

export const codeSamples = {
  ...gettingStartedSamples,
  /** Short ids — assigned explicitly so lookup always works (no spread-only aliases). */
  gs1: gs.sample1LoginConnect,
  gs2: gs.sample2CreateAudiotoolClient,
  gs3: gs.sample3NexusEvents,
  gs4: gs.sample4ModifyTonematrix,
  starterChain: `// ==========================================
// SAMPLE: HEISENBERG → DELAY (AUDIO CABLE)
// ==========================================
console.log("--- Loading sample: Heisenberg → Delay ---");

await nexus.modify((t) => {
  const synth = t.create("heisenberg", {
    displayName: "Sample Synth",
    positionX: 100,
    positionY: 160,
    gain: 0.7,
  });

  const delay = t.create("stompboxDelay", {
    displayName: "Sample Delay",
    positionX: 420,
    positionY: 160,
    mix: 0.45,
    feedbackFactor: 0.35,
  });

  t.create("desktopAudioCable", {
    fromSocket: synth.fields.audioOutput.location,
    toSocket: delay.fields.audioInput.location,
  });
});

console.log("> Done: wired synth output into delay input.");`,

  seqToDrums: `// ==========================================
// SAMPLE: TONEMATRIX → MACHINISTE (NOTE CABLE)
// ==========================================
console.log("--- Loading sample: ToneMatrix → Machiniste ---");

await nexus.modify((t) => {
  const drums = t.create("machiniste", {
    displayName: "Sample Drums",
    positionX: 520,
    positionY: 140,
  });

  const seq = t.create("tonematrix", {
    displayName: "Sample Sequencer",
    positionX: 140,
    positionY: 140,
  });

  t.create("desktopNoteCable", {
    fromSocket: seq.fields.noteOutput.location,
    toSocket: drums.fields.notesInput.location,
  });
});

console.log("> Done: wired ToneMatrix noteOutput into Machiniste notesInput.");`,

  rangeSliderGain: `// ==========================================
// SAMPLE: RANGE SLIDER → SYNTH GAIN (native DOM only)
// ==========================================
console.log("--- Loading sample: range → gain ---");

let synth;
await nexus.modify((t) => {
  synth = t.create("heisenberg", {
    displayName: "Slider Synth",
    positionX: 120,
    positionY: 160,
    gain: 0.7,
  });
});

const ui = document.getElementById("nexus-ui-container");
ui.innerHTML = "";

const lab = document.createElement("label");
lab.textContent = "Synth gain";
lab.style.display = "block";
lab.style.fontWeight = "700";
lab.style.marginBottom = "8px";

const slider = document.createElement("input");
slider.type = "range";
slider.min = "0";
slider.max = "1";
slider.step = "0.01";
slider.value = "0.7";

slider.addEventListener("input", async (e) => {
  const v = parseFloat(e.target.value);
  try {
    await nexus.modify((t) => t.update(synth.fields.gain, v));
    console.log("> gain:", v.toFixed(2));
  } catch (err) {
    console.warn("Update failed:", err);
  }
});

ui.appendChild(lab);
ui.appendChild(slider);`,

  offlineDashboard: `// ==========================================
// SAMPLE: MINI SYNTH DASHBOARD (OFFLINE, NATIVE DOM)
// ==========================================
console.log("--- Loading sample: Mini Synth Dashboard ---");

let synth;
let reverb;
await nexus.modify((t) => {
  synth = t.create("heisenberg", { positionX: 120, positionY: 120, gain: 0.7 });
  reverb = t.create("stompboxReverb", { positionX: 420, positionY: 120, mix: 0.45 });

  t.create("desktopAudioCable", {
    fromSocket: synth.fields.audioOutput.location,
    toSocket: reverb.fields.audioInput.location,
  });
});
console.log("> Synth + reverb wired.");

const ui = document.getElementById("nexus-ui-container");
ui.innerHTML = "";

const title = document.createElement("div");
title.textContent = "Mini Synth Dashboard";
title.style.fontWeight = "900";
title.style.marginBottom = "12px";
ui.appendChild(title);

function addRange(labelText, min, max, step, initial, onInput) {
  const wrap = document.createElement("div");
  wrap.style.marginBottom = "12px";
  const lab = document.createElement("label");
  lab.textContent = labelText;
  lab.style.display = "block";
  lab.style.fontSize = "12px";
  lab.style.marginBottom = "4px";
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(initial);
  input.addEventListener("input", (e) => onInput(parseFloat(e.target.value)));
  wrap.appendChild(lab);
  wrap.appendChild(input);
  ui.appendChild(wrap);
}

addRange("Synth gain", 0, 1, 0.01, 0.7, async (v) => {
  await nexus.modify((t) => t.update(synth.fields.gain, v));
  console.log("> gain:", v.toFixed(2));
});

addRange("Reverb mix", 0, 1, 0.01, 0.45, async (v) => {
  await nexus.modify((t) => t.update(reverb.fields.mix, v));
  console.log("> reverb mix:", v.toFixed(2));
});

console.log("> Move the sliders to drive the engine.");`,

  abcVisualizer: `// ==========================================
// SAMPLE: ABC notation → Nexus timeline (SDK-focused)
// ==========================================
// abcjs only draws the score. The interesting part is nexus.modify below:
// noteCollection, gakki, noteTrack, noteRegion, many note, optional cable, config duration.

console.log("--- Loading sample: ABC → timeline ---");

const NEXUS_TICKS_BEAT = 3840;
const NEXUS_TICKS_SEMIBREVE = 15360;
const MAX_NOTES = 1200;

const abcjsMod = await import("https://esm.sh/abcjs");
const abcjs = abcjsMod.default ?? abcjsMod;

const ui = document.getElementById("nexus-ui-container");
ui.innerHTML = \`
  <div style="font-weight:700; margin-bottom:6px;">ABC → timeline</div>
  <textarea id="abc-source" spellcheck="false" style="
    width:100%; min-height:110px; resize:vertical; padding:8px; border-radius:8px;
    border:1px solid var(--border); background:#fff; color:#111;
    font-family: ui-monospace, monospace; font-size:12px;
  ">X:1
T:Twinkle fragment
M:4/4
L:1/8
Q:1/4=100
K:C
CC GG | AA G2 |</textarea>
  <div style="display:flex; gap:8px; margin-top:8px;">
    <button id="abc-render" type="button">Render</button>
    <button id="abc-import" type="button">Import (synced project)</button>
  </div>
  <div id="abc-status" style="margin-top:8px; font-size:12px; color: var(--text-muted);"></div>
  <div id="abc-paper" style="margin-top:8px; padding:8px; border:1px solid var(--border); border-radius:8px; overflow:auto;"></div>
\`;

const sourceEl = document.getElementById("abc-source");
const statusEl = document.getElementById("abc-status");
const paperEl = document.getElementById("abc-paper");
const renderBtn = document.getElementById("abc-render");
const importBtn = document.getElementById("abc-import");
importBtn.title = "Requires Connect Project. Uses nexus.modify + t.create / t.update.";

function setStatus(msg, isErr = false) {
  statusEl.textContent = msg;
  statusEl.style.color = isErr ? "#ef4444" : "var(--text-muted)";
}

function ensureHeaders(text) {
  const t = (text || "").trim();
  if (!t) return "";
  return /^\\s*X:/im.test(t) ? t : "X:1\\n" + t;
}

function parseAbc(abcText) {
  const raw = ensureHeaders(abcText);
  if (!raw) throw new Error("Paste ABC first.");

  const tunes = abcjs.parseOnly(raw, {});
  const tune = tunes?.[0];
  if (!tune) throw new Error("Could not parse ABC tune.");
  const audio = tune.setUpAudio({});

  const notes = [];
  for (const track of audio.tracks || []) {
    for (const ev of track) {
      if (ev.cmd !== "note" || typeof ev.pitch !== "number" || ev.duration <= 0) continue;
      notes.push({
        pitch: Math.max(0, Math.min(127, ev.pitch)),
        positionTicks: Math.round(ev.start * NEXUS_TICKS_SEMIBREVE),
        durationTicks: Math.max(1, Math.round(ev.duration * NEXUS_TICKS_SEMIBREVE)),
        velocity: typeof ev.volume === "number" ? Math.min(1, Math.max(0.05, ev.volume / 127)) : 0.78,
      });
      if (notes.length >= MAX_NOTES) break;
    }
    if (notes.length >= MAX_NOTES) break;
  }
  notes.sort((a, b) => a.positionTicks - b.positionTicks || a.pitch - b.pitch);
  if (!notes.length) throw new Error("No notes parsed from ABC.");

  const title = (tune.metaText?.title && String(tune.metaText.title).trim()) || "ABC import";
  const maxEndTicks = notes.reduce((m, n) => Math.max(m, n.positionTicks + n.durationTicks), 0);
  return { raw, notes, title, maxEndTicks };
}

function nextTrackOrderAmong(t) {
  const types = ["noteTrack", "patternTrack", "audioTrack", "automationTrack"];
  let max = -1;
  for (const ty of types) {
    for (const e of t.entities.ofTypes(ty).get()) {
      const v = e.fields.orderAmongTracks?.value;
      if (typeof v === "number" && v > max) max = v;
    }
  }
  return max + 1;
}

function getOrCreateGakki(t, label) {
  const existing = t.entities.ofTypes("gakki").get();
  if (existing.length) return existing[0];
  return t.create("gakki", {
    displayName: label.slice(0, 52) || "ABC",
    positionX: 160,
    positionY: 220,
    gain: 0.78,
  });
}

/** Optional: one desktopAudioCable to the first free mixer strip (keeps sample short). */
function tryCableToMixer(t, player) {
  const out = player.fields?.audioOutput?.location;
  if (!out) return false;
  if (t.entities.pointingTo.locations(out).get().length > 0) return true;
  for (const ch of t.entities.ofTypes("mixerChannel").get()) {
    const inLoc = ch.fields.audioInput?.location;
    if (inLoc && t.entities.pointingTo.locations(inLoc).get().length === 0) {
      t.create("desktopAudioCable", { fromSocket: out, toSocket: inLoc });
      return true;
    }
  }
  return false;
}

function renderScore() {
  try {
    const raw = ensureHeaders(sourceEl.value);
    if (!raw) throw new Error("Paste ABC first.");
    paperEl.innerHTML = "";
    abcjs.renderAbc("abc-paper", raw, { responsive: "resize" });
    setStatus("Rendered.");
  } catch (err) {
    setStatus(String(err?.message || err), true);
  }
}

renderBtn.addEventListener("click", renderScore);
renderScore();

importBtn.addEventListener("click", async () => {
  try {
    // __NEXUS_MODE__ is injected by Run (parent window); preview iframe window.* is not set.
    if (__NEXUS_MODE__ !== "synced" || !nexus?.modify) {
      throw new Error("Connect Project first (synced cloud).");
    }
    setStatus("Importing…");
    const parsed = parseAbc(sourceEl.value);
    await nexus.modify((t) => {
      const coll = t.create("noteCollection", {});
      const player = getOrCreateGakki(t, parsed.title);
      const track = t.create("noteTrack", {
        player: player.location,
        orderAmongTracks: nextTrackOrderAmong(t),
        isEnabled: true,
      });
      const dur = Math.max(NEXUS_TICKS_SEMIBREVE, parsed.maxEndTicks + NEXUS_TICKS_BEAT * 2);
      t.create("noteRegion", {
        collection: coll.location,
        track: track.location,
        region: {
          positionTicks: 0,
          durationTicks: dur,
          loopOffsetTicks: 0,
          loopDurationTicks: dur,
          collectionOffsetTicks: 0,
          displayName: parsed.title.slice(0, 80),
          isEnabled: true,
        },
      });
      for (const n of parsed.notes) {
        t.create("note", {
          collection: coll.location,
          positionTicks: n.positionTicks,
          durationTicks: n.durationTicks,
          pitch: n.pitch,
          velocity: n.velocity,
        });
      }
      tryCableToMixer(t, player);
      const minProjLen = Math.max(dur + NEXUS_TICKS_BEAT * 8, NEXUS_TICKS_SEMIBREVE * 4);
      for (const cfg of t.entities.ofTypes("config").get()) {
        const cur = cfg.fields.durationTicks?.value;
        if (typeof cur === "number" && cur < minProjLen) {
          t.update(cfg.fields.durationTicks, minProjLen);
        }
      }
    });
    setStatus("Imported " + parsed.notes.length + " notes via nexus.modify.");
    console.log("> ABC import:", parsed.notes.length, "notes");
  } catch (err) {
    setStatus(String(err?.message || err), true);
    console.warn(err);
  }
});`,
};
