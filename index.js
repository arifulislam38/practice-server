const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

//middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser())

// Custom Middlewares

const isValid = (req, res, next) => {
  const token = req.cookies;
  if (!token.Token) {
    res.status(401).send({ Message: "Unauthorized Access" });
  } else {
    const decoded = jwt.verify(token.Token, process.env.JWT_TOKEN, (err, decoded) => {
      if (err) {
        res.status(401).send({ Message: "Unauthorized Access" });
      } else {
        req.userEmail = decoded.userEmail;
        next()
      }
    })
  }
}



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
    console.log("successfully connected to MongoDB!");
    // Collections
    const userCollection = client.db("Practice").collection("users");
    const booksCollection = client.db("Practice").collection("books");

    // All Api Connections
    app.get("/", (req, res) => {
      res.send("Welcome to the Practice server");
    });
    // Users API
    app.get("/users", async (req, res) => {
        const users = await userCollection.find({}).toArray();
      res.send(users);
    });
      
    app.post('/users', async (req, res) => {
          const user = req.body;
          const result = await userCollection.insertOne(user);
          res.send(result)
    })
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_TOKEN, { expiresIn: "1h" });
      res
        .cookie("Token", token, {
          httpOnly: true,
          secure: false
        })
        .send({ token });
    })

    app.get('/books', isValid, async (req, res) => {
      const validUser = req.userEmail === req.query.user;
      if (validUser) {
        const books = await booksCollection.find({}).toArray();
        res.send({ books });
      } else {
        res.status(401).send({Message: 'Unauthorized Access'})
      }
    })

    app.get("/clearcookie", (req, res) => {
      res.clearCookie("Token").send({ Message: "hey ha ha ha" });
    });

  } catch (error) {
    console.error(error);
  }
}
run().catch(console.dir);

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await client.close(); // Close the MongoDB connection
  process.exit(0); // Exit the process
});

app.listen(port, () => {
  console.log(`Server running on the port: ${port}`);
});
