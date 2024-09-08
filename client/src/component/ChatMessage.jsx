
/* eslint-disable react/prop-types */
import { FaCheckDouble, FaTrashAlt } from "react-icons/fa";
import { useState } from "react";
import { DeleteMessageModal } from "./DeleteMessageModal.jsx";
import { deleteMessageApi } from "../service/api.jsx";
import { useSetRecoilState } from "recoil";
import { messagesAtomState } from "../stores/message/messageAtom.js";
import { deleteMessage } from "../service/socket.js";


export const ChatMessage = ({
  message,
  messageId,
  time,
  sender,
  senderImage,
  isSender,
  currentUser,
  selectedUser,
}) => {
  const [showDelete, setShowDelete] = useState(false);
  const [hover, setHover] = useState(false);
  const setMessages = useSetRecoilState(messagesAtomState);
 
  const handleToggleDelete = () => {
    setShowDelete((prev) => !prev);
  };

  const handleDeleteMessage = async () => {
    try {
      if (currentUser === sender) {
        setMessages((previous) =>
          previous.filter((msg) => msg.messageId !== messageId)
        );

        deleteMessage(currentUser, selectedUser, messageId);
        await deleteMessageApi(messageId, false);
      } else {
        setMessages((previous) =>
          previous.filter((msg) => msg.messageId !== messageId)
        );
        await deleteMessageApi(messageId, true);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-4`}>
      {!isSender && (
        <img
          src={senderImage}
          alt={sender}
          className="w-10 h-10 rounded-full mr-3"
        />
      )}
      <div className={"max-w-[60%] text-left relative"}>
        {!isSender && (
          <div className="text-sm text-gray-700 mb-1">
            {sender} <span className="text-xs text-gray-400">{time}</span>
          </div>
        )}

        <div
          className={`${
            isSender ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
          } p-2 rounded-lg break-words relative cursor-pointer pr-8`}
          style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => {
            setHover(!hover);
          }} // Toggle delete option on double click
        >
          {message}
          <div className=" ml-4">
            {hover && (
              <FaTrashAlt
                className={`absolute top-1/2 right-2 transform -translate-y-1/2 text-red-600 cursor-pointer `}
                onClick={handleToggleDelete} // Show modal on click
              />
            )}
          </div>
        </div>

        {isSender && (
          <div className="text-xs text-gray-400 flex items-center justify-end mt-1">
            {time} <FaCheckDouble className="ml-1 text-blue-500" />
          </div>
        )}

        {showDelete && (
          <DeleteMessageModal
            show={showDelete}
            onClose={handleToggleDelete}
            onDelete={handleDeleteMessage}
          />
        )}
      </div>
      {isSender && (
        <img
          src={senderImage}
          alt={sender}
          className="w-10 h-10 rounded-full ml-3"
        />
      )}
    </div>
  );
};
