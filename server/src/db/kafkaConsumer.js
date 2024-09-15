import dotenv from 'dotenv'
dotenv.config()
import { Kafka } from 'kafkajs'
import { Message } from '../model/message.model.js'
import mongoose from 'mongoose'
import { ObjectId } from 'mongodb'

const KAFKA_TOPIC = process.env.KAFKA_TOPIC
const KAFKA_BATCH_SIZE = process.env.KAFKA_BATCH_SIZE
const KAFKA_FLUSH_INTERVAL = process.env.KAFKA_FLUSH_INTERVAL

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: [process.env.KAFKA_BROKER1],
  ssl: true, // prod
  // ssl: false, // dev
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
})


let consumer;
let messageBuffer = [];
let flushTimeout;


const initKafkaConsumer = async () => {
  try {
    consumer = kafka.consumer({ groupId: 'message-group' });
    console.log('Kafka Consumer Connecting..');
    await consumer.connect();
    console.log('Kafka Consumer Connected');
    await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: false })
    console.log('Subscribed to message topic')

    flushTimeout = setTimeout(flushMessages, KAFKA_FLUSH_INTERVAL)

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const { senderId, receiverId, msgId, mgs, timestamp } = JSON.parse(message.value.toString());

        console.log('sender: ', senderId)
        console.log('receiver: ', receiverId)
        console.log('msg: ', mgs)
        console.log(new Date(timestamp).toLocaleString())
        console.log('Kafka message string: ', message)
        messageBuffer.push({
          sender: new ObjectId(senderId),
          receiver: new ObjectId(receiverId),
          messageId: msgId,
          message: mgs,
          timestamp: new Date(timestamp),
        });

        if (messageBuffer.length >= KAFKA_BATCH_SIZE) {
          clearTimeout(flushTimeout);
          await flushMessages();
        }
      }
    })
  } catch (error) {
    console.log('Error in Kafka Consumer Connection: ', error);
    throw error
  }
};


const flushMessages = async () => {
  if (messageBuffer.length === 0) return

  try {
    await Message.insertMany(messageBuffer)
    console.log(`Batch of ${messageBuffer.length} messages saved to MongoDB`)
  } catch (error) {
    console.log("Error saving Kafka Batch to MongoDB: ", error)
  } finally {
    messageBuffer = [];
    clearTimeout(flushTimeout);
    flushTimeout = setTimeout(flushMessages, KAFKA_FLUSH_INTERVAL);
  }
}


export { initKafkaConsumer }