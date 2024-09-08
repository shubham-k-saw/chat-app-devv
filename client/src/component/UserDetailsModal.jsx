/* eslint-disable react/prop-types */
import { FaTimes } from "react-icons/fa";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  friendsAtomState,
  requestedByMeAtomState,
  requestsAtomState,
} from "../stores/friend/friendAtom";
import {
  acceptRequest,
  rejectRequest,
  sendRequest,
  unFriendRequest,
  unSendRequest,
} from "../service/socket";
import { currentUserAtomState } from "../stores/user/userAtom.js";
import {
  acceptRequestApi,
  rejectRequestApi,
  sendRequestApi,
  unFriendApi,
} from "../service/api";


const UserDetailsModal = ({ isOpen, onClose, selectedUser }) => {
  const [friends, setFriends] = useRecoilState(friendsAtomState);
  const [requests, setRequests] = useRecoilState(requestsAtomState);
  const currentUser = useRecoilValue(currentUserAtomState);
  const [requestedByMe, setRequestedByMe] = useRecoilState(
    requestedByMeAtomState
  );
  // const navigate = useNavigate();

  if (!isOpen) return null;

  // console.log(selectedUser)
  const isFriend = () => {
    return friends.some((friend) => {
      return friend.friendInfo.userName === selectedUser.userName;
    });
  };

  const isRequest = () => {
    return requests.some((request) => {
      return request.requestInfo.userName === selectedUser.userName;
    });
  };

  const isRequestedByMe = () => {
    return requestedByMe.some((item) => {
      return item.userName === selectedUser.userName;
    });
  };
  const handleUnFriendRequest = async () => {
    try {
      await unFriendApi(selectedUser._id, currentUser._id);
      setFriends((previous) => {
        return previous.filter(
          (item) => item.friendInfo.userName !== selectedUser.userName
        );
      });
      unFriendRequest(currentUser.userName, selectedUser.userName);
    } catch (error) {
      console.error("Getting error while unfriend user ", error);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      const friend = await acceptRequestApi(
        selectedUser._id,
        currentUser._id,
      );

      const myNewFriend = requests.filter((request) => {
        return request.requestInfo.userName === selectedUser.userName;
      })[0];

      // myNewFriend.friendInfo = myNewFriend.requestInfo;
      // delete myNewFriend.requestInfo;
      setFriends((preFriends) => {
        return [
          ...preFriends,
          { _id: myNewFriend._id, friendInfo: myNewFriend.requestInfo },
        ];
      });
      
      const updatedRequests = requests.filter((request) => {
        return request.requestInfo.userName !== selectedUser.userName;
      });

      setRequests(updatedRequests);

      acceptRequest(selectedUser.userName, friend.data.data);
    } catch (error) {
      console.error("Failed to accept the friend request:", error);
    }
  };

  const handleRejectRequest = async () => {
    try {
      await rejectRequestApi(selectedUser._id, currentUser._id);
      const updatedRequests = requests.filter((request) => {
        return request.requestInfo.userName !== selectedUser.userName;
      });
      setRequests(updatedRequests);
      rejectRequest(selectedUser.userName, currentUser.userName);
    } catch (error) {
      console.error("Getting error while rejecting the request ", error);
    }
  };

  const handleSendRequest = async () => {
    try {
      const sendNewRequest = await sendRequestApi(
        currentUser._id,
        selectedUser._id,
      );

      setRequestedByMe((previous) => {
        return [...previous, { userName: selectedUser.userName }];
      });

      sendRequest(selectedUser.userName, sendNewRequest.data.data);
    } catch (error) {
      console.error("Failed to send the request: ", error);
    }
  };

  const handleUnSendRequest = async () => {
    try {
      await rejectRequestApi(currentUser._id, selectedUser._id);
      setRequestedByMe((previous) => {
        return previous.filter((item) => {
          return item.userName !== selectedUser.userName;
        });
      });
      unSendRequest(selectedUser.userName, currentUser.userName);
    } catch (error) {
      console.error("Getting error while UnSending the request ", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-md mt-10 p-6 rounded-lg shadow-lg transform transition-transform duration-300 ease-out">
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FaTimes />
        </button>

        {/* User Details */}
        <div className="flex flex-col items-center space-y-3">
          <img
            className="w-24 h-24 rounded-full"
            src={
              selectedUser.profilePicture ||
              "https://png.pngtree.com/png-clipart/20190924/original/pngtree-user-vector-avatar-png-image_4830521.jpg"
            }
            alt="User"
          />
          <h3 className="text-lg font-semibold">{selectedUser.userName}</h3>
          <p className="text-sm">
            {selectedUser.firstName} {selectedUser.lastName}
          </p>
        </div>

        <div className=" text-center p-3">
          {isFriend() && (
            <button
              className="bg-red-500 p-2 border hover:bg-red-600 text-white rounded-md"
              onClick={handleUnFriendRequest}
            >
              Unfriend
            </button>
          )}

          {isRequest() && (
            <div className=" space-x-3">
              <button
                className="bg-green-500 p-2 px-4 border hover:bg-green-600 text-white rounded-md"
                onClick={handleAcceptRequest}
              >
                Accept
              </button>
              <button
                className="bg-red-500 p-2 px-4 border hover:bg-red-600 text-white rounded-md"
                onClick={handleRejectRequest}
              >
                Reject
              </button>
            </div>
          )}

          {isRequestedByMe() && (
            <button
              className="bg-red-500 p-2 px-4 border hover:bg-red-600 text-white rounded-md"
              onClick={handleUnSendRequest}
            >
              Unsend Request
            </button>
          )}

          {!isFriend() && !isRequest() && !isRequestedByMe() && (
            <button
              className="bg-green-500 p-2 border hover:bg-green-600 text-white rounded-md"
              onClick={handleSendRequest}
            >
              Send Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
