"use client";
import React, { useRef, useState } from "react";
import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    setFile(file);
  };

  const handleRemoveBackground = async () => {
    if (!file) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      const model = bodySegmentation.SupportedModels.BodyPix;
      const segmenterConfig: bodySegmentation.BodyPixModelConfig = {
        // architecture: "MobileNetV1",
        // outputStride: 8,
        // quantBytes: 4,
        // multiplier: 1,
        architecture: "ResNet50",
        outputStride: 16,
        quantBytes: 2,
      };
      const segmenter = await bodySegmentation.createSegmenter(
        model,
        segmenterConfig
      );
      const segmentationConfig: bodySegmentation.BodyPixSegmentationConfig = {
        multiSegmentation: false,
        segmentBodyParts: false,
        internalResolution: "full",
      };

      const people = await segmenter.segmentPeople(img, segmentationConfig);
      const coloredPartImage = await bodySegmentation.toBinaryMask(people);
      const opacity = 0.7;
      const flipHorizontal = false;
      const maskBlurAmount = 0;
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Draw the mask image on top of the original image onto a canvas.
      // The colored part image will be drawn semi-transparent, with an opacity of
      // 0.7, allowing for the original image to be visible under.
      bodySegmentation.drawMask(
        canvas,
        img,
        coloredPartImage,
        opacity,
        maskBlurAmount,
        flipHorizontal
      );
    };
  };

  return (
    <div>
      <h1>TensorFlow.js Image Prediction</h1>
      <input type="file" onChange={handleFileUpload} accept="image/*" />
      <canvas ref={canvasRef} />
      <button onClick={handleRemoveBackground}>remove</button>
    </div>
  );
}
