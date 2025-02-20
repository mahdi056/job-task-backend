const cors = require('cors');
const express = require( 'express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yhwb0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


      const database = client.db('job-task');
      const taskCollection = database.collection('tasks');


       //  GET All Tasks
    app.get('/tasks', async (req, res) => {
      try {
        const tasks = await taskCollection.find({}).toArray();
        res.json(tasks);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch tasks", error });
      }
    });

    // POST Add a New Task
    app.post('/tasks', async (req, res) => {
      try {
        const { title, description, category } = req.body;
        if (!title || !description || !category) {
          return res.status(400).json({ message: "All fields (title, description, category) are required!" });
        }

        const newTask = {
          title,
          description,
          category,
          timestamp: new Date().toISOString(),
        };

        const result = await taskCollection.insertOne(newTask);
        res.json({ message: "Task added successfully", task: result.ops?.[0] || newTask });
      } catch (error) {
        res.status(500).json({ message: "Failed to add task", error });
      }
    });

    //  PUT update Task
    app.put('/tasks/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { title, description } = req.body;

        if (!title || !description) {
          return res.status(400).json({ message: "Title and Description are required for updating!" });
        }

        const result = await taskCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { title, description } }
        );

        res.json({ success: true, updatedTask: result });
      } catch (error) {
        res.status(500).json({ message: "Failed to update task", error });
      }
    });

    // DELETE a Task
    app.delete('/tasks/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const deletedTask = await taskCollection.deleteOne({ _id: new ObjectId(id) });

        res.json({ message: "Task deleted successfully", deletedTask });
      } catch (error) {
        res.status(500).json({ message: "Failed to delete task", error });
      }
    });























    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send("Server is running")
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
})


