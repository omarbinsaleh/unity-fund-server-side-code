require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// create express application and define the port:
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// uri for the mongoDB
const uri = `mongodb+srv://${process.env.UNITY_FUND_DB_USERNAME}:${process.env.UNITY_FUND_DB_PASSWORD}@cluster0.fev0e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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

      const db = client.db("unityFundDB");
      const campaignCollection = db.collection("allCampaigns"); // all campaigns collection
      const userCollection = db.collection('users'); // all existing user collection

      // The default home route:
      app.get('/', (req, res) => {
         res.send("Unity Fund server is connected to mongoDB....")
      })

      // add new user
      app.post('/users/create', async(req, res) => {
         const newUser = req.body;
         const result = await userCollection.insertOne(newUser);
         res.send(result);
      })

      // get all users:
      app.get('/users', async (req, res) => {
         const users = await userCollection.find().toArray() || [];
         res.send(users);
      })

      // get a particular user using id:
      app.get('/user/:id', async (req, res) => {
         const id = req.params.id;
         const query = {_id : new ObjectId(id)};
         const  user = await userCollection(query);
         res.send(user);
      })
      
      // add new campaign 
      app.post('/campaigns/create', async (req, res) => {
         const newCampaign = req.body;
         const result = await campaignCollection.insertOne(newCampaign);
         res.send(result);
      })
      
      // get all the avaiable campaigns:
      app.get('/campaigns', async (req, res) => {
         const cursor = campaignCollection.find();
         const allCampaigns = await cursor.toArray() || [];
         res.send(allCampaigns);
      })

      // get a particular campaign data using id
      app.get('/campaigns/:id', async (req, res) => {
         const id = req.params.id;
         const query = {_id : new ObjectId(id)};
         const campaign = campaignCollection.find(query);
         res.send(campaign);
      })

      // Send a ping to confirm a successful connection
      //  await client.db("admin").command({ ping: 1 });
      //  console.log("Pinged your deployment. You successfully connected to MongoDB!");
   } finally {
      // Ensures that the client will close when you finish/error
      //  await client.close();
   }
}
run().catch(console.dir);


app.listen(port, () => {
   console.log(`Unity Fund Server is running on port: ${port}`);
})

module.exports = app;