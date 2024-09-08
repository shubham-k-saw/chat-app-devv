import { Friend } from "../model/friend.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const sendRequest = asyncHandler(async (req, res) => {
  const { requestedBy, requestedTo } = req.body;

  if (!requestedBy || !requestedTo) {
    return res.status(400).send({
      message: "All filed required",
    });
  }

  console.log(requestedBy, requestedTo);

  // First, create the friend request
  const friendRequest = await Friend.create({
    requestedBy,
    requestedTo,
    status: "Requested",
  });

  if (!friendRequest) {
    res.status(400).send({
      message: "Friend request not created successfully",
    });
  }

  // Then, populate the `requestedTo` field (excluding the password)
  const populatedFriendRequest = await friendRequest.populate(
    "requestedBy",
    "-password"
  );

  const data = {
    _id: populatedFriendRequest._id,
    requestInfo: populatedFriendRequest.requestedBy,
  };

  return res.status(200).send({
    message: "Friend request created successfully",
    data: data,
  });
});

export const acceptRequest = asyncHandler(async (req, res) => {
  const { requestedBy, requestedTo } = req.body;

  if (!requestedBy && !requestedTo) {
    return res.status(400).send({
      message: "FriendId required",
    });
  }

  // const acceptedRequest = await Friend.findByIdAndUpdate(

  //   { status: "Accepted" },
  //   { new: true }
  // );

  const updatedFriendship = await Friend.findOneAndUpdate(
    { requestedBy, requestedTo }, // Search criteria
    { status: "Accepted" }, // Fields to update
    { new: true }
  ).populate("requestedTo", "-password");

  if (!updatedFriendship) {
    return res.status(400).send({
      message: "Accepted requested is not updated successfully",
    });
  }

  const data = {
    _id: updatedFriendship._id,
    friendInfo: updatedFriendship.requestedTo,
  };

  return res.status(200).send({
    message: "Request Accepted Successfully",
    data: data,
  });
});

export const getFriends = asyncHandler(async (req, res) => {
  const { userId } = req.query;
  const user = req.user;
  console.log("abr ka dabra");
  if (!userId) {
    return res.status(400).send({
      message: "User detail require",
    });
  }

  const friends = await Friend.find({
    status: "Accepted",
    $or: [{ requestedBy: userId }, { requestedTo: userId }],
  })
    .populate("requestedBy", "-password")
    .populate("requestedTo", "-password");

  if (!friends) {
    return res.status(404).send({
      message: "Friend not found",
    });
  }

  const data = friends.map((friend) => {
    return friend.requestedBy.userName !== user.userName
      ? { _id: friend._id, friendInfo: friend.requestedBy }
      : { _id: friend._id, friendInfo: friend.requestedTo };
  });

  return res.status(200).send({
    message: "Friends Fetched Successfully",
    data,
  });
});

export const getRequestedFriend = asyncHandler(async (req, res) => {
  const { requestedTo } = req.query;
  console.log("abr ka dabra", requestedTo);
  if (!requestedTo) {
    return res.status(400).send({
      message: "RequestedTo user detail require",
    });
  }

  const friends = await Friend.find({
    requestedTo,
    status: "Requested",
  }).populate({
    path: "requestedBy",
    select: "-password", // Exclude the password field
  });

  const data = friends.map((friend) => {
    return { _id: friend._id, requestInfo: friend.requestedBy };
  });

  if (!friends) {
    return res.status(404).send({
      message: "Friend not found",
    });
  }

  return res.status(200).send({
    message: "Friends Fetched Successfully",
    data,
  });
});

export const rejectRequest = asyncHandler(async (req, res) => {
  const { requestedBy, requestedTo } = req.body;

  const deletedFriendship = await Friend.findOneAndDelete({
    requestedBy,
    requestedTo,
  });

  if (!deletedFriendship) {
    return res.status(404).send({
      success: false,
      message: "Friendship not found.",
    });
  }

  res.status(200).send({
    success: true,
    message: "Friend deleted successfully.",
  });
});

export const getUsersRequestedByMe = asyncHandler(async (req, res) => {
  const { requestedBy } = req.query;

  const users = await Friend.find({
    requestedBy,
    status: "Requested",
  }).populate("requestedTo", "-password");

  if (!users) {
    return res.status(404).send({
      message: "No any user found which is Requested by you",
    });
  }

  const data = users.map((item) => {
    return { userName: item.requestedTo.userName };
  });

  return res.status(200).send({
    message: "Requested By me user info fetched successfully",
    data,
  });
});

export const unFriend = asyncHandler(async (req, res) => {
  const { user1, user2 } = req.body;

  const deletedFriendship = await Friend.findOneAndDelete({
    $or: [
      { requestedBy: user1, requestedTo: user2 },
      { requestedBy: user2, requestedTo: user1 },
    ],
  });

  if (!deletedFriendship) {
    return res.status(404).send({
      message: "User not found",
    });
  }

  return res.status(200).send({
    message: "UnFriend successfully",
  });
});
