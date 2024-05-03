self.onmessage = function (event: { data: ArrayBuffer }) {
  const fileArrayBytes = event.data;
  const audioContext = new OfflineAudioContext({
    numberOfChannels: 1,
    length: 44100 * 10,
    sampleRate: 44100,
  });
  console.log("Decoding audio data...");
  console.log(fileArrayBytes);
  console.log(audioContext);
  audioContext.decodeAudioData(fileArrayBytes, function (decodedData) {
    console.log("Decoded audio data.");
    console.log(decodedData);
    self.postMessage(decodedData);
  });
};
