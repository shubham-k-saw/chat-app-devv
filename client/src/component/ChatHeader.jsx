
/* eslint-disable react/prop-types */
import { FaVideo, FaPhone, FaEllipsisV, FaArrowLeft } from "react-icons/fa";
import { useRecoilValue } from "recoil";
import { useState } from "react";
import { selectedUserOnlineAtomState } from "../stores/user/userAtom";
import UserDetailsModal from "./UserDetailsModal";

const ChatHeader = ({ isTyping, selectedUser, onBackButtonClick }) => {
  // const isSelectedUserOnline = useRecoilValue(selectedUserOnlineAtomState);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleImageClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white shadow w-full rounded-md h-full">
      {/* Left Section */}
      <div className="flex items-center space-x-3">
        <button className="flex md:hidden" onClick={onBackButtonClick}>
          <FaArrowLeft />
        </button>

        <div
          className=" flex justify-center items-center space-x-2 cursor-pointer"
          onClick={handleImageClick}
        >
          <div className="cursor-pointer">
            {selectedUser.profilePicture ? (
              <img
                className="w-10 h-10 rounded-full"
                src={selectedUser.profilePicture}
                alt="user Image"
              />
            ) : (
              <img
                className="w-10 h-10 rounded-full"
                src="https://png.pngtree.com/png-clipart/20190924/original/pngtree-user-vector-avatar-png-image_4830521.jpg"
                alt="user Image"
              />
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold">{selectedUser.userName}</h3>
            {isTyping && (
              <p className="text-xs text-green-500 font-semibold">
                {selectedUser.userName} is typing...
              </p>
            )}
            {/* {isSelectedUserOnline && !isTyping && (
              <p className="text-xs text-green-500 font-semibold">Online</p>
            )} */}
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex space-x-4 text-gray-500">
        <FaVideo className="cursor-pointer hover:text-gray-700" />
        <FaPhone className="cursor-pointer hover:text-gray-700" />
        <FaEllipsisV className="cursor-pointer hover:text-gray-700" />
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedUser={selectedUser}
      />
    </div>
  );
};

export default ChatHeader;
