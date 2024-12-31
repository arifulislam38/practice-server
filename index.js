const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

//middlewares
app.use(cors());
app.use(express.json());


const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("successfully connected to MongoDB!");
      
    // All Api Connections
    
  } catch (error) {
    console.log(error);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => [res.send("Server hitted in the root")]);

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await client.close(); // Close the MongoDB connection
  process.exit(0); // Exit the process
});

app.listen(port, () => {
  console.log(`Server running on the port: ${port}`);
});
