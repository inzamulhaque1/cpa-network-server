const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const offersCollection = client.db("CpaNetwork").collection("offers");

    // ! =================  USER  ================= !//

    // Get All Users
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })

    // Backend: Get User by Email
    app.get('/users/email/:email', async (req, res) => {
      const { email } = req.params;
      const user = await usersCollection.findOne({ email });

      if (user) {
        return res.send(user);
      }
      res.status(404).send({ error: "User not found" });
    });

    // Register User

    app.post("/users", async (req, res) => {
      const {
        firstName,
        lastName,
        email,
        image,
        role,
        activeStatus,
        uid,
        address,
        city,
        country,
        state,
        zip,
        skype,
        traffic,
        terms,
      } = req.body;

      try {

        const maxPublisherIdUser = await usersCollection
          .find()
          .sort({ publisherId: -1 })
          .limit(1)
          .toArray();


        const nextPublisherId =
          maxPublisherIdUser.length > 0 ? parseInt(maxPublisherIdUser[0].publisherId, 10) + 1 : 1;


        const user = {
          firstName,
          lastName,
          email,
          image,
          uid,
          address,
          city,
          country: country.value,
          state,
          zip,
          skype,
          traffic,
          terms,
          publisherId: nextPublisherId,
          role: role || "user",
          activeStatus: activeStatus || "pending",
          createdAt: new Date(),
        };


        const result = await usersCollection.insertOne(user);

        res.send(result);
      } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send({ error: "Failed to create user" });
      }
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

    // Update User Role
    // Update User Role by ID
    app.patch("/users/role/:id", async (req, res) => {
      const { id } = req.params;
      const { role } = req.body;

      const validRoles = ['admin', 'manager', 'publisher', 'user']; // Allowed roles
      if (!validRoles.includes(role)) {
        return res.status(400).send({ error: "Invalid role" });
      }

      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { role } }
      );

      if (result.modifiedCount === 1) {
        return res.send({ success: true, message: "Role updated successfully" });
      }

      return res.status(404).send({ error: "User not found or role not changed" });
    });


    // update account status

    app.patch("/users/activeStatus/:id", async (req, res) => {
      const { id } = req.params;
      const { activeStatus } = req.body;

      const validStatuses = ['pending', 'approved', 'banned'];  // Allowed statuses
      if (!validStatuses.includes(activeStatus)) {
        return res.status(400).send({ error: "Invalid status" });
      }

      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { activeStatus } }
      );

      if (result.modifiedCount === 1) {
        return res.send({ success: true, message: "Status updated successfully" });
      } else {
        return res.status(404).send({ error: "User not found or status not changed" });
      }
    });

    // ! =================  OFFERS  ================= !//


    // Save Offer Data
    app.post("/offers", async (req, res) => {
      console.log(req.body); // Check if `offerImage` exists
      const { offerImage, ...otherData } = req.body;
      const offer = { ...otherData, offerImage, createdAt: new Date() };
      const result = await offersCollection.insertOne(offer);
      res.send(result);
    });
    

    // Get All Offers
    app.get("/offers", async (req, res) => {

      const offers = await offersCollection.find({}).toArray();
      res.send(offers);
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