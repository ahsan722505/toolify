"use client";
import { LeopardWorker } from "@picovoice/leopard-web";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Spin, Upload, UploadProps, message } from "antd";
import React, { useState } from "react";

const accessKey = "cxHI6rh71yq2uTlxj+FzOZutz5myvjDsvSpoMcC4J6RG4XWgAtpGpw==";
const leopardModel = {
  publicPath: "/leopard_params.pv",
};
function MP3ToText() {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function transcribe() {
    if (!file) return;
    setLoading(true);
    let reader = new FileReader();
    reader.onload = async function () {
      const audioContext = new window.AudioContext({ sampleRate: 16000 });
      const wavBytes = reader.result as ArrayBuffer;
      const worker = new Worker("ffmpeg-worker-mp4.js");
      worker.onmessage = function (e) {
        // I need to get decoded audio data
        // ffmpeg -i input.mp4 -vn -acodec copy output-audio.aac
        const msg = e.data;
        switch (msg.type) {
          case "ready":
            worker.postMessage({
              type: "run",
              arguments: [
                "-i",
                "input.mp4",
                "-vn",
                "-acodec",
                "copy",
                "output-audio.mp4a",
              ],
              MEMFS: [{ name: "input.mp4", data: wavBytes }],
            });
            break;
          case "stdout":
            console.log(msg.data);
            break;
          case "stderr":
            console.log(msg.data);
            break;
          case "done":
            console.log(msg.data);
            break;
        }
      };
      // audioContext.decodeAudioData(wavBytes, async (audioBuffer) => {
      // try {
      //   const f32PCM = audioBuffer.getChannelData(0);
      //   const i16PCM = new Int16Array(f32PCM.length);

      //   const INT16_MAX = 32767;
      //   const INT16_MIN = -32768;
      //   i16PCM.set(
      //     f32PCM.map((f) => {
      //       let i = Math.trunc(f * INT16_MAX);
      //       if (f > INT16_MAX) i = INT16_MAX;
      //       if (f < INT16_MIN) i = INT16_MIN;
      //       return i;
      //     })
      //   );
      //   const leopard = await LeopardWorker.create(accessKey, leopardModel, {
      //     enableAutomaticPunctuation: true,
      //     enableDiarization: true,
      //   });
      //   const { transcript } = await leopard.process(i16PCM, {
      //     transfer: true,
      //   });
      //   setTranscription(transcript);
      // } catch (error) {
      //   console.log(error);
      //   message.error("Failed to transcribe.");
      // } finally {
      //   setLoading(false);
      // }
      // });
    };
    reader.readAsArrayBuffer(file);
  }

  const props: UploadProps = {
    accept:
      "audio/mp3, audio/wav, audio/mpeg, audio/ogg, audio/flac, audio/aac, audio/aiff, audio/wma, audio/opus, audio/webm, video/mp4, video/ogg, video/webm",
    customRequest: async ({ file }) => setFile(file as File),
    disabled: loading,
    showUploadList: false,
  };

  console.log(transcription);

  return (
    <div className="flex justify-start items-center flex-col w-[100vw] h-[100vh] mt-10">
      <h1 className="text-3xl mb-12 text-center">
        Transcribe any audio/video file for free
      </h1>
      <Upload {...props}>
        <Button className="mb-4" type="primary" icon={<UploadOutlined />}>
          Upload audio/video file
        </Button>
        {file && <span className="ml-2">{file.name}</span>}
      </Upload>
      <Button
        loading={loading}
        disabled={!file}
        className="mb-20"
        type="primary"
        onClick={transcribe}
      >
        Transcribe
      </Button>
      <div>
        <label>Transcription:</label>
        <div className="rounded-lg bg-gray-200 min-w-[90vw] max-w-[90vw] p-4 md:min-w-[50vw] md:max-w-[50vw] min-h-20 mt-2 flex justify-center items-center">
          {loading ? <Spin size="large" /> : transcription}
        </div>
      </div>
    </div>
  );
}

export default MP3ToText;
