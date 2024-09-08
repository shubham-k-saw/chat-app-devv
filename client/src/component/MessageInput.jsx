import { useEffect, useState, useRef } from "react";
import { FaPlus, FaFrown, FaPaperPlane, FaMicrophone } from "react-icons/fa";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { sendPrivateMessage, startTyping, stopTyping } from "../service/socket";
import {
  currentUserAtomState,
  selectedUserAtomState,
} from "../stores/user/userAtom.js";
import { messagesAtomState } from "../stores/message/messageAtom.js";
import { messageAtomState } from "../stores/message/messageAtom.js";

export const MessageInput = () => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null); // Use a ref for the picker
  const currentUser = useRecoilValue(currentUserAtomState);
  const setMessages = useSetRecoilState(messagesAtomState);
  const selectedUser = useRecoilValue(selectedUserAtomState);
  const [message, setMessage] = useRecoilState(messageAtomState);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  const generateMessageId = () => {
    const timestamp = Date.now().toString(36); // Convert to base-36 string
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomSuffix}`;
  };

  const handleSendMessage = () => {
    if (!message) {
      return;
    }

    const uniqueID = generateMessageId();
    console.log(uniqueID);
    sendPrivateMessage(
      currentUser.userName,
      selectedUser.userName,
      uniqueID,
      message,
      Date.now(),
      currentUser._id,
      selectedUser._id
    );

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        sender: currentUser._id,
        receiver: selectedUser._id,
        messageId: uniqueID,
        message,
        timestamp: Date.now(),
        deletedByReceiver: false,
      },
    ]);
    setMessage("");
    stopTyping(currentUser.userName, selectedUser.userName);
    clearTimeout(typingTimeoutRef.current);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = () => {
    startTyping(currentUser.userName, selectedUser.userName);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(currentUser.userName, selectedUser.userName);
    }, 1000);
  };

  const addEmoji = (emoji) => {
    setMessage(message + emoji.native);
  };

  return (
    <>
      <div className="flex items-center border border-gray-200 rounded-md p-3 h-full relative">
        <button
          className="text-gray-500 hover:text-gray-700 mr-2 h-[30px] w-[30px] flex items-center justify-center"
          onClick={() => setShowPicker(!showPicker)}
        >
          <FaFrown className="w-[20px] h-[20px]" />
        </button>
        {showPicker && (
          <div
            ref={pickerRef} // Attach the ref to the picker
            style={{ position: "absolute", bottom: "60px", zIndex: 1000 }}
          >
            <Picker data={data} onEmojiSelect={addEmoji} />
          </div>
        )}
        <button className="text-gray-500 hover:text-gray-700 mr-2 font-bold flex justify-center">
          <FaPlus className="w-[20px] h-[20px]" />
        </button>
        <input
          type="text"
          placeholder="Type a message"
          className="flex-grow px-2 h-[35px] bg-gray-200 rounded-sm"
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          value={message}
        />
        {message.trim() ? (
          <button
            className="text-gray-500 hover:text-gray-700 ml-2"
            onClick={handleSendMessage}
          >
            <FaPaperPlane />
          </button>
        ) : (
          <button className="text-gray-500 hover:text-gray-700 ml-2">
            <FaMicrophone className="w-[20px] h-[20px]" />
          </button>
        )}
      </div>
    </>
  );
};
