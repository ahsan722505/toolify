"use client";
import React, { useRef, useState } from "react";
import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/selfie_segmentation";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@mediapipe/pose";

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

  async function performSegmentation(
    model: "BodyPix" | "MediaPipeSelfieSegmentation" | "BlazePose",
    img: HTMLImageElement
  ) {
    if (model === "BodyPix") {
      // body pix
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
      const coloredPartImage = await bodySegmentation.toBinaryMask(
        people,
        { r: 0, g: 0, b: 0, a: 0 },
        { r: 255, g: 255, b: 255, a: 255 }
      );
      const opacity = 1;
      const flipHorizontal = false;
      const maskBlurAmount = 0;
      const canvas = canvasRef.current;
      if (!canvas) return;
      bodySegmentation.drawMask(
        canvas,
        img,
        coloredPartImage,
        opacity,
        maskBlurAmount,
        flipHorizontal
      );
    }

    if (model === "MediaPipeSelfieSegmentation") {
      // selfie segmentation
      const segmenterConfig: bodySegmentation.MediaPipeSelfieSegmentationMediaPipeModelConfig =
        {
          runtime: "mediapipe", // or 'tfjs'
          solutionPath:
            "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation",
          modelType: "general",
        };

      const segmenter = await bodySegmentation.createSegmenter(
        bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation,
        segmenterConfig
      );

      const segmentation = await segmenter.segmentPeople(img);

      const backgroundColor = { r: 255, g: 255, b: 255, a: 255 };
      const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };

      const backgroundDarkeningMask = await bodySegmentation.toBinaryMask(
        segmentation,
        foregroundColor,
        backgroundColor
      );

      const opacity = 1;
      const maskBlurAmount = 0;
      const flipHorizontal = false;

      await bodySegmentation.drawMask(
        canvasRef.current!,
        img,
        backgroundDarkeningMask,
        opacity,
        maskBlurAmount,
        flipHorizontal
      );
    }

    if (model === "BlazePose") {
      // blazepose
      const model = poseDetection.SupportedModels.BlazePose;
      const detectorConfig: poseDetection.BlazePoseMediaPipeModelConfig = {
        runtime: "mediapipe",
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/pose",
        enableSmoothing: false,
        enableSegmentation: true,
        modelType: "heavy",
      };
      const detector = await poseDetection.createDetector(
        model,
        detectorConfig
      );
      const estimationConfig: poseDetection.BlazePoseMediaPipeEstimationConfig =
        { flipHorizontal: false };
      const poses = await detector.estimatePoses(img, estimationConfig);
      const segmentation = poses[0].segmentation;
      if (!segmentation) return;
      const backgroundColor = { r: 255, g: 255, b: 255, a: 255 };
      const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };

      const backgroundDarkeningMask = await bodySegmentation.toBinaryMask(
        segmentation,
        foregroundColor,
        backgroundColor
      );

      const opacity = 1;
      const maskBlurAmount = 0;
      const flipHorizontal = false;
      // Draw the mask onto the image on a canvas.  With opacity set to 0.7 and
      // maskBlurAmount set to 3, this will darken the background and blur the
      // darkened background's edge.
      await bodySegmentation.drawMask(
        canvasRef.current!,
        img,
        backgroundDarkeningMask,
        opacity,
        maskBlurAmount,
        flipHorizontal
      );
    }
  }

  const handleRemoveBackground = async () => {
    if (!file) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      // await performSegmentation("BlazePose", img);
      // await performSegmentation("BodyPix", img);
      await performSegmentation("MediaPipeSelfieSegmentation", img);
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
