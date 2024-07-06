This repo contains two tools:

1. VIDEO TRANSCRIPTION: [Demo](https://toolify-seven.vercel.app/) A tool to create video transcriptions. This tool first extracts raw PCM
data from any audio/video file using web audio api and then sends this data to a machine learning model for speech to text. All of this
happens right in the browser.

2. VIDEO-TO-AUDIO: [Demo](https://toolify-seven.vercel.app/video-to-audio) A tool that converts video to audio file. All the processing
happens in the browser. This tool uses web assembly to run ffmpeg in the browser.
