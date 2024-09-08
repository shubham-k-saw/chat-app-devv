import MessageItem from "../component/MessageItem";
import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  currentUserAtomState,
  onlineUsersAtomState,
  selectedUserAtomState,
} from "../stores/user/userAtom.js";
import { MessageItemList } from "../component/MessageItemList.jsx";
import { Front } from "../component/Front.jsx";
import {
  onPrivateMessage,
  onStopTyping,
  onTyping,
  onUserOffline,
  onUserOnline,
  registerUser,
  socket,
} from "../service/socket.js";
import { messagesAtomState } from "../stores/message/messageAtom.js";
import { isSelectedUserTypingAtomState } from "../stores/message/messageAtom.js";
import { friendsAtomState } from "../stores/friend/friendAtom.js";
import { ChatUi } from "../component/ChatUi.jsx";
import { useNavigate } from "react-router-dom";


export const MessagePage = () => {
  const currentUser = useRecoilValue(currentUserAtomState);
  const selectedUser = useRecoilValue(selectedUserAtomState);
  const setMessages = useSetRecoilState(messagesAtomState);
  const setIsSelectedUserTyping = useSetRecoilState(
    isSelectedUserTypingAtomState
  );
  const setOnlineUsers = useSetRecoilState(onlineUsersAtomState);
  const [isUserSelected, setIsUserSelected] = useState(false);
  // const selectedField = useRecoilValue(selectedFieldAtomState);
  const friends = useRecoilValue(friendsAtomState);
  const navigate = useNavigate()
  // const [isCallAccepted, setIsCallAccepted] = useState(false)
  useEffect(() => {
    // Register the username on the server
    registerUser(currentUser.userName);
    onPrivateMessage(
      ({ senderId, receiverId, messageId, message, timestamp }) => {
        // const time = getCurrentTime(timestamp);
        // const date = getCurrentDate(timestamp);

        if (senderId !== selectedUser._id) {
          return;
        }

        setMessages((previousMessages) => [
          ...previousMessages,
          {
            sender: senderId,
            receiver: receiverId,
            messageId,
            message,
            deletedByReceiver: false,
            timestamp,
          },
        ]);
      }
    );

    onTyping(({ sender }) => {
      if (sender === selectedUser.userName) {
        setIsSelectedUserTyping(true);
      }
    });

    onStopTyping(({ sender }) => {
      if (sender === selectedUser.userName) {
        setIsSelectedUserTyping(false);
      }
    });

    onUserOnline((users) => {
      setOnlineUsers(users);
    });

    onUserOffline((user) => {
      setOnlineUsers((prevUsers) => prevUsers.filter((u) => u !== user));
    });

    return () => {
      socket.off("private_message");
      socket.off("user_online");
      socket.off("user_offline");
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [selectedUser, currentUser]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const res = await getCurrentUser();
  //       setCurrentUser(res.data.data);
  //     } catch (error) {
  //       navigate("/login");
  //       console.error(error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  const handleUserSelect = () => {
    // setSelectedUser(user);
    setIsUserSelected(true);
  };

  const handleBackToChatList = () => {
    navigate("/")
    setIsUserSelected(false);
  };

  const isSelectedUserFriend = () => {
    return friends.some(
      (item) => item.friendInfo.userName === selectedUser.userName
    );
  };

  return (
    <div className="h-screen bg-gray-300 p-[1vh]">
      
      <div className="grid grid-cols-1 md:grid-cols-[30%_69%] lg:grid-cols-[25%_74%] gap-x-[1%] h-full">
        {/* Message List */}
        <div
          className={`bg-white p-[2vh] rounded-md overflow-auto scrollbar-hide space-y-1 ${
            isUserSelected ? "hidden md:block" : "block"
          }`}
        >
          <div className="h-[10%]">
            <MessageItem
              src={
                currentUser.profilePicture ? currentUser.profilePicture : null
              }
              username={currentUser.userName}
              isOnline={true}
              lastMessage="Info account"
              // onClick={handleBackToChatList} // Go back to chat list
            />
          </div>
          <div className="h-[88%]">
            <MessageItemList onSelectUser={handleUserSelect} />
          </div>
        </div>

        {/* Chat UI */}
        <div
          className={`bg-white rounded-md flex flex-col h-full ${
            isUserSelected ? "block" : "hidden md:block"
          }`}
        >
          {Object.keys(selectedUser).length > 0 ? (
            <ChatUi
              selectedUserInfo={selectedUser}
              currentUser={currentUser.userName}
              onBackButtonClick={handleBackToChatList}
              isSelectedUserFriend={isSelectedUserFriend}
            />
          ) : (
            <Front />
          )}
        </div>
      </div>
    </div>
  );
};

