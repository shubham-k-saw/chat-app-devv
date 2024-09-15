import dotenv from 'dotenv'
dotenv.config()
import { Kafka } from 'kafkajs'


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

let producer;
let messageBuffer = [];
let flushTimeout;

const initKafkaProducer = async () => {
  try {
    producer = kafka.producer();
    console.log('Kafka Producer Connecting..');
    await producer.connect();
    console.log('Kafka Producer Connected');
    flushTimeout = setTimeout(flushMessages, KAFKA_FLUSH_INTERVAL)
  } catch (error) {
    console.log('Error in Kafka Producer Connection: ', error);
    throw error
  }
};


const flushMessages = async () => {
  if (messageBuffer.length === 0) return

  try {
    console.log('Step 4: sending message to kafka')
    await producer.send({
      topic: KAFKA_TOPIC,
      messages: messageBuffer
    })
  } catch (error) {
    console.log('Error logging messages to kafka: ', error)
  } finally {
    messageBuffer = [];
    clearTimeout(flushTimeout);
    flushTimeout = setTimeout(flushMessages, KAFKA_FLUSH_INTERVAL);   // Restart the flush timer
  }
}

const logMessageToKafka = async (senderId, receiverId, messageId, message, timestamp) => {
  console.log('Step 2: sending message to buffer')
  messageBuffer.push({
    // key: sender,   // same key will go to same partition, so removing key for round robin
    value: JSON.stringify({
      senderId,
      receiverId,
      msgId: messageId,
      mgs: message,
      timestamp: timestamp || Date.now()
    })
  })

  if (messageBuffer.length >= KAFKA_BATCH_SIZE) {
    console.log('step 3: flushing message buffer')
    clearTimeout(flushTimeout)
    await flushMessages()
  }
};


export { initKafkaProducer, logMessageToKafka }