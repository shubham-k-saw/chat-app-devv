import mongoose from "mongoose";


const dbConnect = async() =>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log("Database connect successfully")
    }catch(error) {
        console.log("MONGODB connection FAILED: " , error)
        // console.log("error ")
        process.exit(1)
    }
}

export {dbConnect}