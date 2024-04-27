"use client";
import { LeopardWorker } from "@picovoice/leopard-web";
import React, { useState } from "react";

const accessKey = "cxHI6rh71yq2uTlxj+FzOZutz5myvjDsvSpoMcC4J6RG4XWgAtpGpw==";
const leopardModel = {
  publicPath: "/leopard_params.pv",
};
function MP3ToText() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>("");

  function handleAudioFile(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;
    const file = event.target.files[0];
    if (!file) return;
    setAudioFile(file);
  }

  async function transcribe() {
    if (!audioFile) return;
    let reader = new FileReader();
    reader.onload = function (ev) {
      const audioContext = new (window.AudioContext ||
        window.webKitAudioContext)({ sampleRate: 16000 });
      let wavBytes = reader.result as ArrayBuffer;
      audioContext.decodeAudioData(wavBytes, async (audioBuffer) => {
        const f32PCM = audioBuffer.getChannelData(0);
        const i16PCM = new Int16Array(f32PCM.length);

        const INT16_MAX = 32767;
        const INT16_MIN = -32768;
        i16PCM.set(
          f32PCM.map((f) => {
            let i = Math.trunc(f * INT16_MAX);
            if (f > INT16_MAX) i = INT16_MAX;
            if (f < INT16_MIN) i = INT16_MIN;
            return i;
          })
        );
        const leopard = await LeopardWorker.create(accessKey, leopardModel, {
          enableAutomaticPunctuation: true,
          enableDiarization: true,
        });
        const { transcript, words } = await leopard.process(i16PCM, {
          transfer: true,
        });
        setTranscription(transcript);
        console.log(transcript);
        console.log(words);
      });
    };
    reader.readAsArrayBuffer(audioFile);
  }

  return (
    <div>
      <input type="file" onChange={handleAudioFile} />
      <button onClick={transcribe}>Transcribe</button>
      <div>{transcription}</div>
    </div>
  );
}

export default MP3ToText;
