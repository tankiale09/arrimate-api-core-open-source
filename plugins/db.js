import mongoose from "mongoose";
function dbConnection(fastify, ops, done) {
  const { MONGODB_URI } = fastify.config;
  // Connect to the database
  async function dbConnection() {
    try {
      await mongoose.connect(MONGODB_URI,{
        connectTimeoutMS: 1000,
      });
      fastify.log.info("Connected to MongoDB");
    } catch (error) {
      console.error(error);
      throw new Error("Error connecting to the database");
    }
  }
  dbConnection();
  done();
}

export default dbConnection;
