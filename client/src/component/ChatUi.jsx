/* eslint-disable react/prop-types */

import { useRecoilValue } from "recoil";
import { isSelectedUserTypingAtomState } from "../stores/message/messageAtom";
import ChatBody from "./ChatBody";
import ChatHeader from "./ChatHeader";
import { MessageInput } from "./MessageInput";

export const ChatUi = ({
  selectedUserInfo,
  currentUser,
  onBackButtonClick,
  isSelectedUserFriend,
}) => {
  const isSelectedUserTyping = useRecoilValue(isSelectedUserTypingAtomState);

  return (
    <div>
      <div className="flex items-center h-[11vh]">
        <ChatHeader
          isTyping={isSelectedUserTyping}
          selectedUser={selectedUserInfo}
          currentUser={currentUser}
          onBackButtonClick={onBackButtonClick}
        />
      </div>
      <div className="h-[76vh]">
        <div className="flex-1 h-full">
          <ChatBody />
        </div>
      </div>

      <div className="h-[11vh]">{isSelectedUserFriend() && <MessageInput />}</div>
    </div>
  );
};
