const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    'http://localhost:5173',
  ],
  credentials: true,
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.skihu85.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const productsCollection = client.db('jobDb').collection('job');

    // app.get('/all-products', async (req, res) => {
    //   const size = parseInt(req.query.size)
    //   const page = parseInt(req.query.page) - 1
    //   const filter = req.query.filter
    //   const sort = req.query.sort
    //   const search = req.query.search
    //   console.log(size, page)

    //   let query = {
    //     productName: { $regex: search, $options: 'i' },
    //   }
    //   if (filter) query.category = filter
    //   let options = {}
    //   if (sort) options = { sort: { creationDate: sort === 'asc' ? 1 : -1 } }
    //   const result = await productsCollection
    //     .find(query, options)
    //     .skip(page * size)
    //     .limit(size)
    //     .toArray()
    //   res.send(result)
    // })


    app.get('/all-products', async (req, res) => {
      const size = parseInt(req.query.size)
      const page = parseInt(req.query.page) - 1
      const filter = req.query.filter
      const sort = req.query.sort
      const search = req.query.search
      const minPrice = parseInt(req.query.minPrice);
      const maxPrice = parseInt(req.query.maxPrice);

      let query = {
        productName: { $regex: search, $options: 'i' },
      }
      if (filter) query.category = filter
      
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        query.price = { $gte: minPrice, $lte: maxPrice };
    } else if (!isNaN(minPrice)) {
        query.price = { $gte: minPrice };
    } else if (!isNaN(maxPrice)) {
        query.price = { $lte: maxPrice };
    }

      let options = {}
      if (sort === 'asc' || sort === 'dsc') {
        options = { sort: { price: sort === 'asc' ? 1 : -1 } }
      } else if (sort === 'newest') {
        options = { sort: { creationDate: -1 } }
      }
      const result = await productsCollection
        .find(query, options)
        .skip(page * size)
        .limit(size)
        .toArray()
      res.send(result)



      // const result = await productsCollection.find().toArray();
      // res.send(result);
    })




    app.get('/products-count', async (req, res) => {
      const filter = req.query.filter
      const search = req.query.search
      const minPrice = parseInt(req.query.minPrice);
      const maxPrice = parseInt(req.query.maxPrice);

      let query = {
        productName: { $regex: search, $options: 'i' },
      }
      if (filter) query.category = filter
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        query.price = { $gte: minPrice, $lte: maxPrice };
    } else if (!isNaN(minPrice)) {
        query.price = { $gte: minPrice };
    } else if (!isNaN(maxPrice)) {
        query.price = { $lte: maxPrice };
    }
      const count = await productsCollection.countDocuments(query)

      res.send({ count })
    })





    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('job task is working');
})

app.listen(port, () => {
  console.log(`job task is working on ${port}`);
})