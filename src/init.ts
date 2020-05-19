import { v4 } from "uuid";
import { WSS_URL } from "./environment";

export const userId = v4();
export const ws = new WebSocket(`${WSS_URL}?userId=${userId}`);

export const configuration = {
  iceServers: [
    {
      urls: [
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

function registerPeerConnectionListeners(
  peerConnection: RTCPeerConnection,
  id: string,
  userId: string
) {
  peerConnection.addEventListener(
    "icecandidate",
    ({ candidate }: RTCPeerConnectionIceEventInit) => {
      if (candidate) {
        ws.send(JSON.stringify({ type: "candidate", id, userId, candidate }));
      }
    }
  );
}

export async function processOffer(
  offer: any,
  peerConnection: RTCPeerConnection,
  id: string
) {
  await peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  const roomWithAnswer = {
    answer: {
      type: answer.type,
      sdp: answer.sdp,
    },
  };

  ws.send(
    JSON.stringify({ type: "answer", answer: roomWithAnswer, userId: id })
  );
}

export async function processAnswer(
  answer: any,
  peerConnection: RTCPeerConnection
) {
  if (!peerConnection.currentRemoteDescription && answer) {
    const done = new RTCSessionDescription(answer);
    await peerConnection.setRemoteDescription(done);
  }
}

export async function processCandidates(
  data: any[],
  peerConnection: RTCPeerConnection
) {
  data.forEach((json) =>
    peerConnection.addIceCandidate(new RTCIceCandidate(json))
  );
}

export async function setConnection(
  id: string,
  stream: MediaStream,
  remote: MediaStream,
  peerConnection: RTCPeerConnection
) {
  registerPeerConnectionListeners(peerConnection, id, userId);
  stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, stream);
  });

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  const roomWithOffer = {
    offer: peerConnection.localDescription,
    id,
    userId,
    type: "offer",
  };
  console.log("ws", ws.readyState);
  ws.send(JSON.stringify(roomWithOffer));

  peerConnection.addEventListener("track", (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remote.addTrack(track);
    });
  });
}
