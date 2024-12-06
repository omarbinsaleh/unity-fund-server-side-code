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
      const donatedCollection = db.collection('donatedCollection') // all donated money collection:

      // The default home route:
      app.get('/', (req, res) => {
         res.send("Unity Fund server is connected to mongoDB....")
      })

      // add new user
      app.post('/users/create', async (req, res) => {
         const newUser = req.body;
         const result = await userCollection.insertOne(newUser);
         res.send(result);
      })

      // get all users:
      app.get('/users', async (req, res) => {
         if (req.body && req.body._id) {
            // filter users based on
            const query = {...req.body, _id: new ObjectId(req.body._id)};
            const data = await userCollection.find(query).toArray();
            res.send(data);
         }
         else if (req.body) {
            const query = req.body;
            const data = await userCollection.find(query).toArray();
            res.send(data);
         }
         else {
            const data = await userCollection.find().toArray();
            res.send(data);
         }
      })

      // get a particular user using id:
      app.get('/users/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const user = await userCollection.findOne(query);
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
         if (req.body && req.body._id) {
            const query = {...req.body, _id: new ObjectId(req.body._id)};
            const data = await campaignCollection.find(query).toArray();
            res.send(data);
         }
         else if (req.body) {
            const query = req.body;
            const data = await campaignCollection.find(query).toArray();
            res.send(data);
         }
         else {
            const data = await campaignCollection.find().toArray();
            res.send(data);
         }
      })

      // get a variable number of active campaigns:
      app.get('/campaigns/limit/:count', async (req, res) => {
         const count = parseInt(req.params.count);
         const data = await campaignCollection.find().toArray();
         const result = data.filter(item => {
            const date1 = new Date();
            const date2 = new Date(item.deadline);
            return date1 <= date2;
         });

         res.send(result.slice(0, count));
      });

      // get a particular campaign data using id
      app.get('/campaigns/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const campaign = await campaignCollection.findOne(query);
         res.send(campaign);
      })

      // update campaign:
      app.put('campaigns/update/:id', async(req, res) => {
         const data = req.body;
         const id = req.params.id;
         const query = {_id : new ObjectId(id)};
         const option = { upsert: true};
         const updateDoc = {
            $set : {
               ...data, lastModified: new Date().toLocaleString()
            }
         };
         const result = await campaignCollection.updateOne(query, updateDoc, option);
         res.send(result);
      })

      // delete a campaign:
      app.delete('/campaigns/:id', async(req, res) => {
         const id = req.params.id;
         const query = {_id : new ObjectId(id)};
         const result = await campaignCollection.deleteOne(query);
         res.send(result);
      })

      // add donation to the database
      app.post('/donations', async(req, res) => {
         const donation = req.body;
         const result = await donatedCollection.insertOne(donation);
         res.send(result);
      })

      app.get('/donations', async(req, res) => {
         const data = await donatedCollection.find().toArray();
         res.send(data);
      })

      app.get('donations/:id', async(req, res) => {
         const id = req.params.id;
         const query = {_id : new ObjectId(id)};
         const donation = await donatedCollection.findOne(query);
         res.send(donation);
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