import dotenv from "dotenv";
import { server } from "./src/service/message.service.js";
import { dbConnect } from "./src/db/index.js";

dotenv.config();

const port = process.env.PORT || 8000;

dbConnect()
  .then(() => {
    server.on("Error", (error) => {
        console.log("Server is not connected ", error);
        throw error;
      });

    server.listen(port, () => {
      console.log(`Server is listening at ${port}`);
    });
  })
  .catch((error) => {
    console.log(`Mongodb connection failed ${error}`);
    process.exit(1);
  });
