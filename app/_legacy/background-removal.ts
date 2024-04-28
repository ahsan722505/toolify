// "use client";
// import React, { useRef, useState } from "react";
// import * as bodySegmentation from "@tensorflow-models/body-segmentation";
// import "@tensorflow/tfjs-core";
// import "@tensorflow/tfjs-converter";
// import "@tensorflow/tfjs-backend-webgl";
// import "@mediapipe/selfie_segmentation";

// export default function Home() {
//   const [file, setFile] = useState<File | null>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files) return;
//     const file = e.target.files[0];
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;
//     const img = new Image();
//     img.src = URL.createObjectURL(file);
//     img.onload = () => {
//       canvas.width = img.width;
//       canvas.height = img.height;
//       ctx.drawImage(img, 0, 0);
//     };
//     setFile(file);
//   };

//   async function performSegmentation(
//     model: "BodyPix" | "MediaPipeSelfieSegmentation" | "BlazePose",
//     img: HTMLImageElement
//   ) {
//     if (model === "MediaPipeSelfieSegmentation") {
//       // selfie segmentation
//       const segmenterConfig: bodySegmentation.MediaPipeSelfieSegmentationMediaPipeModelConfig =
//         {
//           runtime: "mediapipe", // or 'tfjs'
//           solutionPath:
//             "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation",
//           modelType: "general",
//         };

//       const segmenter = await bodySegmentation.createSegmenter(
//         bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation,
//         segmenterConfig
//       );

//       const segmentation = await segmenter.segmentPeople(img);

//       const backgroundColor = { r: 255, g: 255, b: 255, a: 255 };
//       const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };

//       const backgroundDarkeningMask = await bodySegmentation.toBinaryMask(
//         segmentation,
//         foregroundColor,
//         backgroundColor
//       );

//       const opacity = 1;
//       const maskBlurAmount = 0;
//       const flipHorizontal = false;

//       await bodySegmentation.drawMask(
//         canvasRef.current!,
//         img,
//         backgroundDarkeningMask,
//         opacity,
//         maskBlurAmount,
//         flipHorizontal
//       );
//     }
//   }

//   const handleRemoveBackground = async () => {
//     if (!file) return;
//     const img = new Image();
//     img.src = URL.createObjectURL(file);
//     img.onload = async () => {
//       await performSegmentation("MediaPipeSelfieSegmentation", img);
//     };
//   };

//   return (
//     <div>
//       <h1>TensorFlow.js Image Prediction</h1>
//       <input type="file" onChange={handleFileUpload} accept="image/*" />
//       <canvas ref={canvasRef} />
//       <button onClick={handleRemoveBackground}>remove</button>
//     </div>
//   );
// }
