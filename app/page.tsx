"use client";
import { LeopardWorker } from "@picovoice/leopard-web";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Spin, Upload, UploadProps, message } from "antd";
import React, { useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const accessKey = process.env.NEXT_PUBLIC_LEOPARD_ACCESS_KEY || "";
const leopardModel = {
  publicPath: "/leopard_params.pv",
};
function MP3ToText() {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const ffmpegRef = useRef(new FFmpeg());
  const isFfmpegLoaded = useRef(false);

  const loadFfmpeg = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      console.log(message);
    });
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    isFfmpegLoaded.current = true;
  };
  function uint8ToUint16(uint8Array: Uint8Array) {
    const uint16Array = new Int16Array(uint8Array.length / 2);
    for (let i = 0; i < uint8Array.length; i += 2) {
      const uint16Value = (uint8Array[i] << 8) | uint8Array[i + 1];
      uint16Array[i / 2] = uint16Value;
    }
    return uint16Array;
  }

  async function transcribe() {
    if (!file) return;
    setLoading(true);
    if (!isFfmpegLoaded.current) await loadFfmpeg();
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile("input.mp4", await fetchFile(file));
    // ffmpeg -i input.flv -f s16le -acodec pcm_s16le output.raw
    // ffmpeg -y  -i input.mp4  -acodec pcm_s16le -f s16le -ac 1 -ar 16000 output.pcm
    // await ffmpeg.exec([
    //   "-i",
    //   "input.mp4",
    //   "-acodec",
    //   "pcm_s16le",
    //   "-f",
    //   "s16le",
    //   "-ac",
    //   "1",
    //   "-ar",
    //   "16000",
    //   "output.pcm",
    // ]);
    await ffmpeg.exec([
      "-i",
      "input.mp4",
      "-acodec",
      "pcm_s16le",
      "-f",
      "s16le",
      "-ac",
      "1",
      "-ar",
      "16000",
      "output.pcm",
    ]);
    const data = (await ffmpeg.readFile("output.pcm")) as Uint8Array;
    console.log(data);
    const int16Array = new Int16Array(data.buffer);
    console.log(int16Array);

    // let reader = new FileReader();
    // reader.onload = async function () {
    // const audioContext = new window.AudioContext({ sampleRate: 16000 });
    // const wavBytes = reader.result as ArrayBuffer;
    // audioContext.decodeAudioData(wavBytes, async (audioBuffer) => {
    try {
      // const f32PCM = audioBuffer.getChannelData(0);
      // const i16PCM = new Int16Array(f32PCM.length);

      // const INT16_MAX = 32767;
      // const INT16_MIN = -32768;
      // i16PCM.set(
      //   f32PCM.map((f) => {
      //     let i = Math.trunc(f * INT16_MAX);
      //     if (f > INT16_MAX) i = INT16_MAX;
      //     if (f < INT16_MIN) i = INT16_MIN;
      //     return i;
      //   })
      // );
      const leopard = await LeopardWorker.create(accessKey, leopardModel, {
        enableAutomaticPunctuation: true,
        enableDiarization: true,
      });
      const { transcript } = await leopard.process(int16Array, {
        transfer: true,
      });
      setTranscription(transcript);
    } catch (error) {
      console.log(error);
      message.error("Failed to transcribe.");
    } finally {
      setLoading(false);
    }
    // });
    // };
    // reader.readAsArrayBuffer(file);
  }

  const props: UploadProps = {
    accept:
      "audio/mp3, audio/wav, audio/mpeg, audio/ogg, audio/flac, audio/aac, audio/aiff, audio/wma, audio/opus, audio/webm, video/mp4, video/ogg, video/webm",
    customRequest: async ({ file }) => setFile(file as File),
    disabled: loading,
    showUploadList: false,
  };

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
