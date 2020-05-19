import React, { useEffect, useState, useRef } from "react";

interface IMediaRecorder {
  start: Function;
  stop: Function;
  ondataavailable: Function;
  state: string;
  isMimeTypeSupported: Function;
}
declare var MediaRecorder: {
  new (stream: MediaStream, options?: any): IMediaRecorder;
  isTypeSupported(type: string): Function;
};

export const Offline = () => {
  const [recorder, setRecorder] = useState<IMediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playRef = useRef<HTMLVideoElement | null>(null);
  const [fileBlob, setBlob] = useState<Blob[]>([]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: { echoCancellation: true, noiseSuppression: true },
      })
      .then((stream) => {
        videoRef.current!.srcObject = stream;
        videoRef.current!.volume = 0;
        videoRef.current!.muted = true;
        const mediaRecorder = new MediaRecorder(stream, { type: "video/webm" });
        setRecorder(mediaRecorder);
        mediaRecorder.ondataavailable = function (evt: any) {
          setBlob([evt.data]);
        };
      });
  }, []);

  const startRecordHandler = () => {
    recorder?.start();
    setRecording(true);
  };

  const stopRecordHandler = () => {
    recorder?.stop();
    setRecording(false);
  };

  const downloadHandler = () => {
    const blob = new Blob(fileBlob, {
      type: "video/webm",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a") as any;
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = "test.webm";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const playHandler = () => {
    const blob = new Blob(fileBlob, {
      type: "video/webm",
    });
    const url = URL.createObjectURL(blob);
    playRef.current!.src = url;
  };

  return (
    <div className={"center"} style={{ flexDirection: "column" }}>
      <video ref={videoRef} autoPlay muted playsInline></video>
      <video
        ref={playRef}
        autoPlay
        playsInline
        controls
        style={{ background: "black" }}
      ></video>
      {!recording ? (
        <button onClick={startRecordHandler}>Начать запись</button>
      ) : (
        <button onClick={stopRecordHandler}>Остановить запись</button>
      )}
      {fileBlob.length ? (
        <>
          <button onClick={downloadHandler}>
            Скачать (кодек VP8, контейнер webm, <br /> нет по умолчнаю в
            Windows, перенести в браузер для воспроизведения)
          </button>

          <button onClick={playHandler}>Воспроизвести</button>
        </>
      ) : null}
    </div>
  );
};
