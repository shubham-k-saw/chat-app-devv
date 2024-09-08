// src/services/api.js
import axios from "axios";

import axiosInterceptor from "./apiInterceptor";

// http://localhost:8000
const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
var api;
// Set up Axi

export const sendVerificationEmail = async (email) => {
  return axios.post(`${API_URL}/user/sendOtp`, { email });
};

export const verifyEmailOtp = async (email, otp) => {
  return axios.post(`${API_URL}/user/verifyOtp`, { email, otp });
};

export const registerUser = async (userData) => {
  console.log("Register successfully");
  return axios.post(`${API_URL}/user/register`, userData);
};

export const loginUser = async (userName, email, password) => {
  return await axios.post(
    `${API_URL}/user/login`,
    {
      userName,
      email,
      password,
    },
    {
      withCredentials: true,
    }
  );
};

export const reFreshAccessToken = async () => {
  return await axios.post(
    `${API_URL}/user/regenerateAccessToken`,
    {},
    {
      withCredentials: true,
    }
  );
};

export const getCurrentUser = async () => {
  api = axiosInterceptor();
  // return await axios.get(`${API_URL}/user/getUser`, { withCredentials: true });
  return await api.get("/user/getUser");
};

export const getUsersDetail = async () => {
  // return await axios.get(`${API_URL}/user/getUsers`, { withCredentials: true });
  api = axiosInterceptor();
  return await api.get("/user/getUsers");
};

export const uploadProfilePicture = async (formData) => {
  // return await axios.patch(`${API_URL}/user/uploadProfilePic`, formData, {
  //   withCredentials: true,
  // });
  api = axiosInterceptor();
  return await api.patch("/user/uploadProfilePic", formData);
};

export const deleteProfilePicture = async () => {
  // return await axios.delete(`${API_URL}/user/deleteProfilePic`, {
  //   withCredentials: true,
  // });
  api = axiosInterceptor();
  return await api.delete("/user/deleteProfilePic");
};

export const changePassword = async (passwordDetails) => {
  // console.log(passwordDetails);
  // return await axios.post(`${API_URL}/user/changePassword`, passwordDetails, {
  //   withCredentials: true,
  // });

  api = axiosInterceptor();
  return await api.post("/user/changePassword", passwordDetails);
};

export const logoutUser = async () => {
  // return await axios.post(
  //   `${API_URL}/user/logout`,
  //   {},
  //   {
  //     withCredentials: true,
  //   }
  // );

  api = axiosInterceptor();
  return await api.post("/user/logout", {});
};

export const getMessages = async (
  currentUserId,
  selectedUserId,
  page,
  limit,
  
) => {
  // return await axios.get(`${API_URL}/message/getMessages`, {
  //   params: {
  //     senderId: currentUserId,
  //     receiverId: selectedUserId,
  //     page: page,
  //     limit: limit,
  //   },
  //   withCredentials: true, // This should be part of the main config object
  // });

  api = axiosInterceptor();
  return await api.get(`/message/getMessages`, {
    params: {
      senderId: currentUserId,
      receiverId: selectedUserId,
      page: page,
      limit: limit,
    },
  });
};

export const getFriends = async (userId) => {
  // console.log("USer detail", userId)
  // return await axios.get(`${API_URL}/friend/getFriends`, {
  //   params: { userId },
  //   withCredentials: true,
  // });

  api = axiosInterceptor();
  return await api.get(`friend/getFriends`, {
    params: { userId },
  });
};

export const getRequests = async (requestedTo) => {
  // return await axios.get(`${API_URL}/friend/getRequestedFriends`, {
  //   params: { requestedTo },
  //   withCredentials: true,
  // });

  api = axiosInterceptor();
  return await api.get(`/friend/getRequestedFriends`, {
    params: { requestedTo },
  });
};

export const sendRequestApi = async (requestedBy, requestedTo) => {
  // return await axios.post(
  //   `${API_URL}/friend/addFriend`,
  //   { requestedBy, requestedTo },
  //   { withCredentials: true }
  // );

  api = axiosInterceptor();
  return await api.post(`/friend/addFriend`, { requestedBy, requestedTo });
};

export const acceptRequestApi = async (requestedBy, requestedTo) => {
  // return await axios.put(
  //   `${API_URL}/friend/acceptRequest`,
  //   { requestedBy, requestedTo },
  //   { withCredentials: true }
  // );

  api = axiosInterceptor();
  return await api.put(`/friend/acceptRequest`, { requestedBy, requestedTo });
};

export const rejectRequestApi = async (requestedBy, requestedTo) => {
  // return await axios.delete(`${API_URL}/friend/rejectRequest`, {
  //   data: { requestedBy, requestedTo },
  //   withCredentials: true,
  // });

  api = axiosInterceptor();
  return await api.delete(`/friend/rejectRequest`, {
    data: { requestedBy, requestedTo },
  });
};

export const getUserRequestedByMeApi = async (requestedBy) => {
  // return await axios.get(`${API_URL}/friend/requestedByMe`, {
  //   params: { requestedBy },
  //   withCredentials: true,
  // });

  api = axiosInterceptor();
  return await api.get(`/friend/requestedByMe`, {
    params: { requestedBy },
    withCredentials: true,
  });
};

export const unFriendApi = async (user1, user2) => {
  // return await axios.delete(`${API_URL}/friend/unFriend`, {
  //   data: { user1, user2 },
  // });

  api = axiosInterceptor();
  return await api.delete(`/friend/unFriend`, {
    data: { user1, user2 },
  });
};

export const searchUsers = async (query) => {
  // console.log(query);
  // return await axios.get(`${API_URL}/user/search?query=${query}`, {
  //   withCredentials: true,
  // });

  api = axiosInterceptor();
  return await api.get(`/user/search?query=${query}`);
};

export const deleteMessageApi = async (
  messageId,
  isDeletedByReceiver,
) => {
  api = axiosInterceptor();
  try {
    // return await axios.delete(`${API_URL}/message/deleteMessage`, {
    //   data: { messageId, isDeletedByReceiver },
    //   withCredentials: true,
    // });
    return await api.delete(`message/deleteMessage`, {
      data: { messageId, isDeletedByReceiver },
    });
  } catch (error) {
    console.error("Getting error while deleting the message: ", error);
  }
};
