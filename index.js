const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();



// Middleware
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Server is running...");
});



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k3e8u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
    // await client.connect();

    const usersCollection = client.db("CpaNetwork").collection("users")
    // Get All Users
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })

    // Register User
    app.post("/users", async (req, res) => {
      const { firstName, lastName, email, image, role, activeStatus, uid, address, city, country, state, zip, skype, traffic, terms } = req.body;
      console.log(email);
      const user = { firstName, lastName, email, image, role: role || 'user', activeStatus: activeStatus || 'pending', uid, address, city, country: country.value, state, zip, skype, traffic, terms };

      const result = await usersCollection.insertOne(user);

      res.send(result)
    });

    // Get Role by Email (or Authentication Identifier)
    app.get("/users/role/:email", async (req, res) => {
      const { email } = req.params;
      const user = await usersCollection.findOne({ email: email });

      if (user) {
        return res.send({ role: user.role || "user" });
      }
      res.status(404).send({ error: "User not found" });
    });


















    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});