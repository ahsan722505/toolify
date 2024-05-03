"use client";
import { Button, Upload, UploadProps, message } from "antd";
import React, { useRef } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const page = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [converting, setConverting] = React.useState<boolean>(false);
  const ffmpegRef = useRef(new FFmpeg());
  const isFfmpegLoaded = useRef(false);
  const props: UploadProps = {
    accept: "video/mp4",
    customRequest: async ({ file }) => setFile(file as File),
    disabled: converting,
    showUploadList: false,
  };

  const loadFfmpeg = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const ffmpeg = ffmpegRef.current;
    // ffmpeg.on("log", ({ message }) => {
    //   console.log(message);
    // });
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    isFfmpegLoaded.current = true;
  };

  const handleConvertFile = async () => {
    if (!file) return;
    try {
      setConverting(true);
      if (!isFfmpegLoaded.current) await loadFfmpeg();
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile("input.mp4", await fetchFile(file));
      await ffmpeg.exec(["-i", "input.mp4", "output.mp3"]);
      const data = (await ffmpeg.readFile("output.mp3")) as Uint8Array;
      const blob = new Blob([data], { type: "audio/mpeg" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "output.mp3";
      link.click();
      window.URL.revokeObjectURL(url);
      message.success("Audio file downloaded successfully.");
    } catch (error) {
      message.error("Failed to convert video to audio");
    } finally {
      setConverting(false);
    }
  };
  return (
    <div className="flex justify-start items-center flex-col w-[100vw] h-[100vh] mt-10">
      <h1 className="text-3xl mb-12 text-center">
        Convert video to audio for free
      </h1>
      <Upload {...props}>
        <Button className="mb-4" type="primary" icon={<UploadOutlined />}>
          Upload video file
        </Button>
        {file && <span className="ml-2">{file.name}</span>}
      </Upload>
      <Button
        loading={converting}
        disabled={!file}
        className="mb-20"
        type="primary"
        onClick={handleConvertFile}
      >
        Convert
      </Button>
    </div>
  );
};

export default page;
