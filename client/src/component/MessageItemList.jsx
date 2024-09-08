// * eslint-disable react/prop-types */
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useState, useEffect } from "react";
import {
  currentUserAtomState,
  onlineUsersAtomState,
  selectedUserAtomState,
} from "../stores/user/userAtom.js";
import MessageItem from "./MessageItem.jsx";
import {
  getFriends,
  getRequests,
  getUserRequestedByMeApi,
  getUsersDetail,
  searchUsers,
} from "../service/api.jsx";
import {
  findUserAtomState,
  friendsAtomState,
  requestedByMeAtomState,
  requestsAtomState,
  selectedFieldAtomState,
} from "../stores/friend/friendAtom.js";
import {
  onAcceptRequest,
  onRejectRequest,
  onSendRequest,
  onUnFriendRequest,
  onUnSendRequest,
  socket,
} from "../service/socket.js";
import { useNavigate } from "react-router-dom";

export const MessageItemList = ({ onSelectUser }) => {
  // const [allUserDetails, setAllUserDetails] = useRecoilState(allUserAtomState);
  const onlineUsers = useRecoilValue(onlineUsersAtomState);
  const [friendsDetails, setFriendsDetails] = useRecoilState(friendsAtomState);
  const [requestsDetails, setRequestsDetails] =
    useRecoilState(requestsAtomState);
  const currentUser = useRecoilValue(currentUserAtomState);
  const [selectedField, setSelectedField] = useRecoilState(
    selectedFieldAtomState
  );
  const setSelectedUser = useSetRecoilState(selectedUserAtomState);
  const [findUsers, setFindUsers] = useRecoilState(findUserAtomState);
  const [query, setQuery] = useState("");
  const setRequestedByMeDetails = useSetRecoilState(requestedByMeAtomState);

  // New states for searching the data
  const [originalFriends, setOriginalFriends] = useState([]);
  const [originalRequests, setOriginalRequests] = useState([]);
  const navigate = useNavigate();

  const findOnlineUser = (username) => {
    return onlineUsers.includes(username);
  };

  useEffect(() => {
    onAcceptRequest(({ friend }) => {
      setFriendsDetails((preFriends) => {
        return [...preFriends, friend];
      });
      setRequestedByMeDetails((previous) => {
        return previous.filter((item) => {
          return item.userName !== friend.friendInfo.userName;
        });
      });
    });

    onSendRequest(({ request }) => {
      setRequestsDetails((preRequests) => {
        return [...preRequests, request];
      });
    });

    onRejectRequest(({ requestedTo }) => {
      setRequestedByMeDetails((previous) => {
        return previous.filter((item) => {
          return item.userName !== requestedTo;
        });
      });
    });

    onUnSendRequest(({ requestedBy }) => {
      console.log(requestedBy);
      setRequestsDetails((previous) => {
        return previous.filter((item) => {
          return item.requestInfo.userName !== requestedBy;
        });
      });
    });

    onUnFriendRequest(({ from }) => {
      setFriendsDetails((previous) => {
        return previous.filter((item) => {
          return item.friendInfo.userName !== from;
        });
      });
    });

    return () => {
      socket.off("accept-request");
      socket.off("send-request");
      socket.off("reject-request");
      socket.off("unsend-request");
      socket.off("unFriend-request");
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // console.log("abara ajsd", currentUser)
        if (Object.values(currentUser).length == 0) {
          return;
        }
        // console.log(currentUser)
        const friends = (await getFriends(currentUser._id)).data.data;
        const requests = (await getRequests(currentUser._id)).data.data;
        const users = await getUsersDetail();
        const requestedByMe = await getUserRequestedByMeApi(currentUser._id);
        setFriendsDetails(friends);
        setRequestsDetails(requests);
        setFindUsers(users.data.data);
        setRequestedByMeDetails(requestedByMe.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [currentUser]);

  useEffect(() => {
    setOriginalFriends(friendsDetails);
    setOriginalRequests(requestsDetails);
  }, [friendsDetails, requestsDetails]);

  const searchFriendsController = (q) => {
    if (!q) {
      // If query is empty, show all friends
      setOriginalFriends(friendsDetails);
    } else {
      // Filter friends based on the query
      // console.log("frinendl", friends);
      const result = originalFriends.filter((user) =>
        user.friendInfo.userName.toLowerCase().includes(q.toLowerCase())
      );
      setOriginalFriends(result);
    }
  };

  const searchRequestsController = (q) => {
    if (!q) {
      setOriginalRequests(requestsDetails); // Show all requests if query is empty
    } else {
      const result = originalRequests.filter((user) =>
        user.requestInfo.userName.toLowerCase().includes(q.toLowerCase())
      );
      setOriginalRequests(result);
    }
  };

  const searchUsersController = async (q) => {
    const res = await searchUsers(q);
    setFindUsers(res.data.data);
  };

  const handleSearch = async (e) => {
    setQuery(e.target.value);

    if (selectedField === "friends") {
      searchFriendsController(e.target.value);
    } else if (selectedField === "requests") {
      searchRequestsController(e.target.value);
    } else {
      await searchUsersController(e.target.value);
    }
  };

  return (
    <div className="w-full h-full space-y-2 p-2 ">
      <div className="h-[20%] space-y-1">
        <hr />
        <input
          type="text"
          className="w-full px-4 py-1 border border-gray-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search..."
          value={query}
          onChange={handleSearch}
        />
        {/* Buttons to switch between Friends and Requests */}
        <div className="flex flex-center justify-center mb-2 border border-gray-200 rounded-lg">
          <button
            className={`w-auto px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap text-center ${
              selectedField === "friends"
                ? "text-blue-600 hover:text-blue-700"
                : "text-black-600 hover:text-blue-700"
            }`}
            onClick={() => {
              setSelectedField("friends");
              setSelectedUser({});
              navigate("/");
              setQuery("");
            }}
          >
            Friends
          </button>
          <button
            className={`w-auto px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap text-center ${
              selectedField === "requests"
                ? "text-blue-600 hover:text-blue-700"
                : "text-black-600 hover:text-blue-700"
            }`}
            onClick={() => {
              setSelectedField("requests");
              setSelectedUser({});
              setQuery("");
              navigate("/");
            }}
          >
            Requests
          </button>
          <button
            className={`w-auto px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap text-center ${
              selectedField === "findUsers"
                ? "text-blue-600 hover:text-blue-700"
                : "text-black-600 hover:text-blue-700"
            }`}
            onClick={() => {
              setSelectedField("findUsers");
              setSelectedUser({});
              setQuery("");
              navigate("/");
            }}
          >
            Find Users
          </button>
        </div>
      </div>
      {/* Conditionally render friends or requests based on the selected view */}
      <div className="space-y-2 overflow-y-auto scrollbar-hide h-[80%]">
        {selectedField === "friends" &&
          originalFriends.map((friend) => {
            return (
              <MessageItem
                src={
                  friend.friendInfo.profilePicture
                    ? friend.friendInfo.profilePicture
                    : null
                }
                key={friend._id}
                username={friend.friendInfo.userName}
                isOnline={findOnlineUser(friend.friendInfo.userName)}
                onSelectUser={onSelectUser}
                userInfo={friend.friendInfo}
                isFriend={true}
              />
            );
          })}

        {selectedField === "requests" &&
          originalRequests.map((request) => {
            return (
              <MessageItem
                src={request.requestInfo.profilePicture || null}
                key={request._id}
                username={request.requestInfo.userName}
                isOnline={findOnlineUser(request.requestInfo.userName)}
                onSelectUser={onSelectUser}
                userInfo={request.requestInfo}
                isFriend={false}
              />
            );
          })}

        {selectedField === "findUsers" &&
          findUsers.map((user) => {
            return (
              <MessageItem
                src={user.profilePicture ? user.profilePicture : null}
                key={user._id}
                username={user.userName}
                isOnline={findOnlineUser(user.userName)}
                onSelectUser={onSelectUser}
                userInfo={user}
                isFriend={false}
              />
            );
          })}
      </div>
    </div>
  );
};
