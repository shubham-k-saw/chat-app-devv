import Redis from 'ioredis'
import { io } from '../service/message.service.js'
import { users } from '../service/message.service.js'

const MESSAGE_CHANNEL = process.env.MESSAGE_CHANNEL

const publisher = new Redis(process.env.REDIS_URI)
const subscriber = new Redis(process.env.REDIS_URI)


const publishMessage = async (msg) => {
  try {
    await publisher.publish(MESSAGE_CHANNEL, msg)
  } catch (error) {
    console.log("Error publishing message to redis: ", error)
  }
}

const subscribeMessage = async () => {
  try {
    subscriber.subscribe(MESSAGE_CHANNEL, (err, count) => {
      if (err) {
        console.error('Failed to subscribe:', err.message);
      } else {
        console.log(`Subscribed to ${MESSAGE_CHANNEL}. Total subscriptions: ${count}`);
      }
    })

    subscriber.on('message', (MESSAGE_CHANNEL, message) => {
      console.log(`Recieved message from ${MESSAGE_CHANNEL}: ${message}`)
      const parsedMsg = JSON.parse(message)

      const receiverSocketId = users[parsedMsg.receiver]
      console.log('Users connected to socket: ', users)
      console.log('Reciever socket id: ', receiverSocketId)

      if (receiverSocketId) {
        console.log("Send the message")
        io.to(receiverSocketId).emit("private_message", {
          receiverId: parsedMsg.receiverId,
          senderId: parsedMsg.senderId,
          message: parsedMsg.message,
          messageId: parsedMsg.messageId,
          timestamp: parsedMsg.timestamp,
        });
      } else {
        console.log(`Receiver ${parsedMsg.receiver} not online`);
      }

    })
  } catch (error) {
    console.log("Error Subscribing redis channel: ", error)
  }
}

export { publishMessage, subscribeMessage }