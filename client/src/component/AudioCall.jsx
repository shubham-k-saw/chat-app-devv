// AudioCall.js
import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import {
  socket,
  callUser,
  acceptCall,
  rejectCall,
  endCall,
} from "../service/socket.js";

function AudioCall({ currentUser, selectedUser }) {
  const [isCalling, setIsCalling] = useState(false);
  const [isCallIncoming, setIsCallIncoming] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callFrom, setCallFrom] = useState(null);
  const [incomingSignal, setIncomingSignal] = useState(null);
  const peerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Handle incoming call
    socket.on("call-made", ({ signal, from }) => {
      setIsCallIncoming(true);
      setCallFrom(from);
      setIncomingSignal(signal);
    });

    // Handle call acceptance
    socket.on("call-accepted", (signal) => {
      if (peerRef.current) {
        peerRef.current.signal(signal);
      }
    });

    // Handle call rejection
    socket.on("call-rejected", () => {
      alert("The user rejected your call.");
      cleanup();
    });

    // Handle call end from the other user
    socket.on("call-ended", () => {
      alert("The call was ended by the other user.");
      cleanup();
    });

    return () => {
      socket.off("call-made");
      socket.off("call-accepted");
      socket.off("call-rejected");
      socket.off("call-ended");
    };
  }, []);

  const initiateCall = () => {
    setIsCalling(true);
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      audioRef.current.srcObject = stream;
      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream,
      });

      peer.on("signal", (signal) => {
        callUser(currentUser, selectedUser, signal);
      });

      peer.on("stream", (remoteStream) => {
        audioRef.current.srcObject = remoteStream;
        setIsCallActive(true);
      });

      peer.on("close", cleanup);

      peerRef.current = peer;

      // Auto-play the audio element
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Autoplay prevented:", error);
        });
      }
    });
  };

  const answerCall = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      audioRef.current.srcObject = stream;
      const peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream,
      });

      peer.on("signal", (signal) => {
        acceptCall(signal, callFrom);
      });

      peer.on("stream", (remoteStream) => {
        audioRef.current.srcObject = remoteStream;
        setIsCallActive(true);
      });

      peer.on("close", cleanup);

      peerRef.current = peer;
      peer.signal(incomingSignal);
      setIsCallIncoming(false);

      // Auto-play the audio element
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Autoplay prevented:", error);
        });
      }
    });
  };

  const rejectCall = () => {
    rejectCall(callFrom);
    cleanup();
  };

  const endCallForBoth = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      endCall(currentUser, selectedUser);
      cleanup();
    }
  };

  const cleanup = () => {
    if (audioRef.current && audioRef.current.srcObject) {
      audioRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }

    setIsCalling(false);
    setIsCallIncoming(false);
    setIsCallActive(false);
    setCallFrom(null);
    setIncomingSignal(null);
    peerRef.current = null;
  };

  return (
    <div>
      {!isCallActive && (
        <button onClick={initiateCall} disabled={isCalling}>
          {isCalling ? "Calling..." : "Call"}
        </button>
      )}

      {isCallIncoming && !isCallActive && (
        <div>
          <p>Incoming call from {callFrom}</p>
          <button onClick={answerCall}>Answer</button>
          <button onClick={rejectCall}>Reject</button>
        </div>
      )}

      {isCallActive && (
        <button onClick={endCallForBoth} className="end-call-button">
          End Call
        </button>
      )}

      <audio ref={audioRef} autoPlay />
    </div>
  );
}

export { AudioCall };
