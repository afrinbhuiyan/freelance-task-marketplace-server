const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB setup with cached connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cb9e028.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let tasksCollection;
let bidsCollection;

// MongoDB connection cache logic
async function connectToDB() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
    console.log("Connected to MongoDB");
  }
  const db = client.db("tasksDB");
  tasksCollection = db.collection("tasks");
  bidsCollection = db.collection("bids");
}

// Initialize DB connection once
connectToDB().catch(console.dir);

// Routes
app.get("/", (req, res) => {
  res.send("Freelance Task Marketplace Server is running");
});

app.get("/tasks", async (req, res) => {
  const email = req.query.email;
  const query = email ? { userEmail: email } : {};
  const tasks = await tasksCollection.find(query).toArray();
  res.send(tasks);
});

app.get("/tasks/featured", async (req, res) => {
  const tasks = await tasksCollection
    .find({})
    .sort({ deadline: 1 })
    .limit(6)
    .toArray();
  res.send(tasks);
});

app.get("/tasks/:id", async (req, res) => {
  const id = req.params.id;
  const task = await tasksCollection.findOne({ _id: new ObjectId(id) });
  res.send(task);
});

app.post("/tasks", async (req, res) => {
  try {
    const newTask = req.body;
    const result = await tasksCollection.insertOne(newTask);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to insert task" });
  }
});

app.put("/tasks/:id", async (req, res) => {
  const id = req.params.id;
  const updatedTask = req.body;
  const result = await tasksCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedTask }
  );
  res.send(result);
});

app.delete("/tasks/:id", async (req, res) => {
  const id = req.params.id;
  const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

app.get("/bids", async (req, res) => {
  const { taskId } = req.query;
  const result = await bidsCollection.find({ taskId }).toArray();
  res.send(result);
});

app.post("/bids", async (req, res) => {
  const bid = req.body;
  const result = await bidsCollection.insertOne(bid);
  res.send(result);
});

// Server listen
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
