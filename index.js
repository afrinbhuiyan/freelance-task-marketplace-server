const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cb9e028.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const tasksCollection = client.db("tasksDB").collection("tasks");
    const bidsCollection = client.db("tasksDB").collection("bids");

    app.get("/tasks", async (req, res) => {
      const email = req.query.email;
      const query = email ? { email } : {};
      const tasks = await tasksCollection.find(query).toArray();
      res.send(tasks);
    });

    app.get("/tasks", async (req, res) => {
      const email = req.query.email;

      console.log(email)

      if (email) {
        const tasks = await tasksCollection
          .find({ userEmail: email })
          .toArray();
        return res.send(tasks);
      }
      const tasks = await tasksCollection.find().toArray();
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

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Freelance Task Marketplace Server is running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
