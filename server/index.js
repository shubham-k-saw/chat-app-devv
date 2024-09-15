import dotenv from "dotenv";
import { server } from "./src/service/message.service.js";
import { dbConnect } from "./src/db/index.js";
import { initKafkaProducer } from "./src/db/kafkaProducer.js";
import { initKafkaConsumer } from "./src/db/kafkaConsumer.js";
import { subscribeMessage } from "./src/db/redis.js";

dotenv.config();

const port = process.env.PORT || 8000;

// dbConnect()
//   .then(() => {
//     server.on("Error", (error) => {
//       console.log("Server is not connected ", error);
//       throw error;
//     });

//     server.listen(port, () => {
//       console.log(`Server is listening at ${port}`);
//     });
//   })
//   .catch((error) => {
//     console.log(`Mongodb connection failed ${error}`);
//     process.exit(1);
//   });


const run = async () => {
  try {
    await dbConnect()
    await initKafkaProducer()
    await initKafkaConsumer()
    await subscribeMessage()
    server.on("Error", (error) => {
      console.log("Server is not connected ", error);
      throw error;
    });

    server.listen(port, () => {
      console.log(`Server is listening at ${port}`);
    });
  } catch (error) {
    console.log("Error starting Server: ", error)
    process.exit(1)
  }
}

run()
  .then(() => console.log('All DB connected Successfully'))
  .catch((error) => console.log(error))
