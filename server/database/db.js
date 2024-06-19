import mongoose from "mongoose";

const Connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected to: ", mongoose.connection.host);
  } catch (error) {
    console.log("Error while connecting to DB", error);
  }
};

export default Connection;
