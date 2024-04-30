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
      const mediaSource = new MediaSource();
      const audioElement = new Audio();
      audioElement.src = URL.createObjectURL(mediaSource);

      mediaSource.addEventListener("sourceopen", async function () {
        console.log("MediaSource opened.");
        const sourceBuffer = mediaSource.addSourceBuffer(
          'audio/mp4; codecs="mp4a.40.2"'
        );

        const wavBytes = reader.result as ArrayBuffer;
        const chunkSize = 1024 * 1024; // Define your desired chunk size
        let offset = 0;

        while (offset < wavBytes.byteLength) {
          const chunk = wavBytes.slice(offset, offset + chunkSize);
          sourceBuffer.appendBuffer(chunk);
          offset += chunkSize;
        }

        sourceBuffer.addEventListener("updateend", async function () {
          try {
            console.log("Transcribing...");
            const leopard = await LeopardWorker.create(
              accessKey,
              leopardModel,
              {
                enableAutomaticPunctuation: true,
                enableDiarization: true,
              }
            );
            const { transcript } = await leopard.process(
              audioElement.captureStream(),
              {
                transfer: true,
              }
            );
            console.log("Transcription:", transcript);
            setTranscription(transcript);
          } catch (error) {
            console.log(error);
            message.error("Failed to transcribe.");
          } finally {
            setLoading(false);
          }
        });
      });

      mediaSource.addEventListener("error", function (e) {
        console.log("MediaSource error:", e);
      });
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
