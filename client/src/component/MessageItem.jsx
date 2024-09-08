/* eslint-disable react/prop-types */
import {  useRecoilValue, useSetRecoilState } from "recoil";
import {
  selectedUserAtomState,
  currentUserAtomState,
} from "../stores/user/userAtom";


import { useNavigate } from "react-router-dom";
export default function MessageItem({
  src,
  isOnline = false,
  username,
  lastMessage,
  onSelectUser,
  userInfo,
}) {
  const  setSelectedUser = useSetRecoilState(selectedUserAtomState);
  // const friends = useRecoilValue(friendsAtomState);
  // const friend = friends.filter((user) => user.userName === username)[0];
  const currentUser = useRecoilValue(currentUserAtomState);
  const navigate = useNavigate();

  // console.log(userInfo);

  const handleClick = () => {
    if (currentUser.userName === username) {
      navigate("/user/profile");
    } else {
      setSelectedUser(userInfo);
      console.log(username)
      navigate(`/chat/${username}`)
      onSelectUser(true);
    }
  };

  return (
    <div
      className="  flex space-x-3  p-3 bg-white hover:shadow-lg hover:bg-gray-100 rounded-[10px] hover:cursor-pointer"
      onClick={handleClick}
    >
      <div className=" relative">
        {src ? (
          <img className="w-10 h-10 rounded-full" src={src} alt="user Image" />
        ) : (
          <img
            className="w-10 h-10 rounded-full"
            src="https://png.pngtree.com/png-clipart/20190924/original/pngtree-user-vector-avatar-png-image_4830521.jpg"
            alt="user Image"
          />
        )}

        {isOnline ? (
          <span className="top-0 left-7 absolute  w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
        ) : null}
      </div>
      <div className=" flex flex-col items-start justify-center">
        <p className=" text-sm font-bold">{username}</p>
        <p className=" text-xs">{lastMessage}</p>
      </div>
    </div>
  );
}
