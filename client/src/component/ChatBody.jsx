import { ChatMessage } from "./ChatMessage.jsx";
import { messagesAtomState } from "../stores/message/messageAtom.js";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  currentUserAtomState,
  selectedUserAtomState,
} from "../stores/user/userAtom.js";
import { useCallback, useEffect, useState, useRef } from "react";
import { getDate, getTheActualDate, getTime } from "../utils/dateAndTime.js";
import { getMessages } from "../service/api.jsx";
import { onDeleteMessage } from "../service/socket.js";

 const ChatBody = () => {
  const [messages, setMessages] = useRecoilState(messagesAtomState);
  const currentUser = useRecoilValue(currentUserAtomState);
  const selectedUser = useRecoilValue(selectedUserAtomState);

  const [page, setPage] = useState(1);
  // const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const messageContainerRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!hasMore || !selectedUser._id) return;

    // setLoading(true);
    try {
      const response = await getMessages(
        currentUser._id,
        selectedUser._id,
        page,
        50
      );

      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        setMessages(response.data.data); // Prepend older messages
        setPage((prevPage) => prevPage + 1);
      }

      // Ensure the view jumps to the bottom after messages are set
      if (messageContainerRef.current) {
        messageContainerRef.current.scrollTop =
          messageContainerRef.current.scrollHeight;
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      // setLoading(false);
    }
  }, [selectedUser]);

  // Reset state and fetch new messages when a new user is selected
  useEffect(() => {
    onDeleteMessage(({ from, messageId }) => {
      if (selectedUser.userName !== from) {
        return;
      }

      setMessages((previous) => {
        return previous.filter((message) => message.messageId !== messageId);
      });
    });
    setMessages([]);
    setPage(1);
    setHasMore(true);
    fetchMessages();
  }, [selectedUser]);

  // Jump to the bottom whenever messages change (e.g., new message arrives)
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  let ongoingDate = "";

  return (
    <div
      className="flex flex-col overflow-y-auto scrollbar-hide bg-gray-50 h-full"
      ref={messageContainerRef} // Set the ref here
    >
      <div className="flex-1 p-6 space-y-4">
        {messages.map((item) => {
          const shouldShowDate = !ongoingDate
            ? true
            : getDate(ongoingDate) !== getDate(item.timestamp);

          ongoingDate = getDate(item.timestamp);
          let image = null;

          if (item.sender === currentUser._id) {
            image = currentUser.profilePicture || null;
          } else {
            image = selectedUser.profilePicture || null;
          }

          return (
            <div key={item.messageId}>
              {shouldShowDate && (
                <div className="text-center text-gray-400 text-xs mb-4">
                  {getTheActualDate(item.timestamp)}
                </div>
              )}

              {(item.sender === currentUser._id || !item.deletedByReceiver) && (
                <ChatMessage
                  key={item.messageId}
                  message={item.message}
                  messageId={item.messageId}
                  time={getTime(item.timestamp)}
                  sender={
                    item.sender === currentUser._id
                      ? currentUser.userName
                      : selectedUser.userName
                  }
                  senderImage={
                    image ||
                    "https://png.pngtree.com/png-clipart/20190924/original/pngtree-user-vector-avatar-png-image_4830521.jpg"
                  }
                  isSender={item.sender === currentUser._id}
                  currentUser={currentUser.userName}
                  selectedUser={selectedUser.userName}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatBody;
