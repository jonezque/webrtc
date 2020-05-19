import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import {
  ws,
  configuration,
  processOffer,
  processAnswer,
  setConnection,
  processCandidates,
} from "../init";

const audio = {
  echoCancellation: true,
  noiseSuppression: true,
  googNoiseSuppression: true,
  googNoiseSuppression2: true,
  autoGainControl: true,
  googAutoGainControl: true,
  googAutoGainControl2: true,
  googHighpassFilter: true,
} as any

export const Channel = () => {
  const { id } = useParams();
  const [remote] = useState<MediaStream>(new MediaStream());
  const [peerConnection] = useState<RTCPeerConnection>(
    new RTCPeerConnection(configuration)
  );

  const localStream = useRef<HTMLVideoElement | null>(null);
  const remoteStream = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const handler = (msg: MessageEvent) => {
      const { message, data } = JSON.parse(msg.data);
      if (message === "offer") {
        processOffer(data.offer, peerConnection, data.userId);
      } else if (message === "answer") {
        processAnswer(data.answer, peerConnection);
      } else if (message === "candidates") {
        processCandidates(data, peerConnection);
      }
    };

    ws.addEventListener("message", handler);

    return () => {
      ws.removeEventListener("message", handler);
    };
  }, [peerConnection]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio })
      .then((stream) => {
        localStream.current!.srcObject = stream;
        localStream.current!.muted = true;
        localStream.current!.volume = 0;
        remoteStream.current!.srcObject = remote;
        remoteStream.current!.volume = 0.9;

        const init = () =>
          setTimeout(() => {
            ws.readyState === 1
              ? setConnection(id, stream, remote, peerConnection)
              : init();
          }, 100);
        init();
      })
      .catch((err) => console.warn(err));
  }, [remote, peerConnection, id]);

  return (
    <div>
      <button
        onClick={() => navigator.clipboard.writeText(window.location.href)}
      >
        <b>{window.location.href}</b> - поделиться линком
      </button>
      <video ref={localStream} muted playsInline></video>
      <video ref={remoteStream} playsInline></video>
      <button>Создать комнату</button>
    </div>
  );
};
