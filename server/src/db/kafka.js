import dotenv from 'dotenv'
dotenv.config()
import { Kafka } from 'kafkajs'

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: [process.env.KAFKA_BROKER1],
  // ssl: true, // prod
  ssl: false, // dev
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
})

let producer;

const initKafkaProducer = async () => {
  try {
    producer = kafka.producer();
    console.log('Kafka Producer Connecting..');
    await producer.connect();
    console.log('Kafka Producer Connected');
  } catch (error) {
    console.log('Error in Kafka Producer Connection');
    console.log(error);
  }
};

let consumer;
const initKafkaConsumer = async () => {
  try {
    consumer = kafka.consumer({ groupId: 'message-group' });
    console.log('Kafka Consumer Connecting..');
    await consumer.connect();
    console.log('Kafka Producer Connected');
    await consumer.subscribe({ topic: 'message', fromBeginning: true })
    consumer.log('Subscribed to message topic')

    await consumer.run({

    })
  } catch (error) {
    console.log('Error in Kafka Producer Connection');
    console.log(error);
  }
};

const logMessageToKafka = async (sender, receiver, messageId, message, timestamp) => {
  try {
    const res = await producer.send({
      topic: 'learn-kafka',
      messages: [
        {
          key: sender,
          value: JSON.stringify({
            sender,
            receiver,
            msgId: messageId,
            msg: message,
            timestamp: timestamp || Date.now(),
          }),
        },
      ],
    });

    console.log('Message sent successfully:', res);
  } catch (error) {
    console.log('Error sending message to Kafka');
    console.log(error);
  }
};

// // Start Kafka producer when the app starts
// initKafkaProducer();

// // Example function to send a message
// const logMessage = (sender, receiver, message) => {
//   sendMessageToKafka(sender, receiver, message);
// };

// // Call this function whenever you need to send a message
// logMessage('user001', 'user002', 'Hello Bro! 👋');

export { initKafkaProducer, logMessageToKafka }