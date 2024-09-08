import { Message } from "../model/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMessages = asyncHandler(async (req, res) => {
  const { senderId, receiverId, page = 1, limit = 100 } = req.query;

  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ timestamp: 1 }); // Sort by newest first
    //   .skip((page - 1) * limit)
    //   .limit(parseInt(limit));

    res.status(200).send({
      message: "Message Fetched Successfully",
      data: messages,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId, isDeletedByReceiver } = req.body;

  if (!messageId || isDeletedByReceiver == null) {
    return res.status(400).send({
      message: "messageId and isDeletedByReceiver both field are required",
    });
  }

  if (isDeletedByReceiver) {
    const updatedMessage = await Message.findOneAndUpdate(
      { messageId },
      {
        deletedByReceiver: true,
      },
      {
        new: true,
      }
    );

    if (!updatedMessage) {
      return res.status(404).send({
        message: "message not found",
      });
    }

    return res.status(200).send({
      message: "Message marked as deleted by the receiver.",
    });
  } else {
    const deletedMessage = await Message.findOneAndDelete({ messageId });

    if (!deletedMessage) {
      return res.status(404).send({
        message: "message not found",
      });
    }

    return res.status(200).send({
      message: "Message deleted successfully",
    });
  }
});
