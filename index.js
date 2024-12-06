require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

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

      // get all the avaiable campaigns:
      app.get('/campaigns', async (req, res) => {
         const cursor = campaignCollection.find();
         const allCampaigns = await cursor.toArray() || [];
         res.send(allCampaigns);
      })

      // add new campaign 
      app.post('/campaigns/add', async (req, res) => {
         const campaign = req.body;
         const result = await campaignCollection.insertOne(campaign);
         res.send(result);
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