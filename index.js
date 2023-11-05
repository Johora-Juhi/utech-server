const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

// middlewre
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bkdzfxe.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});
async function run() {
    try {
        const productsCollection = client.db("uTech").collection("products");

        //get all products
        app.get("/allproducts", async (req, res) => {
            const query = {};
            const users = await productsCollection.find(query).toArray();
            res.send(users);
        });
        app.get("/products", async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const query = {};
            const cursor = productsCollection.find(query);
            const products = await cursor
                .skip(page * size)
                .limit(size)
                .sort({ $natural: -1 })
                .toArray();
            const count = await productsCollection.estimatedDocumentCount();
            res.send({ products, count });
        });
        app.get("/top-products", async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const query = {
                rating: { $gte: 4 }
            };
            const cursor = productsCollection.find(query);

            const products = await cursor
                .skip(page * size)
                .limit(size)
                .sort({ $natural: -1 })
                .toArray();
            const count = await productsCollection.countDocuments(query);
            res.send({ products, count });
        });
        //add product
        app.post("/products", async (req, res) => {
            const product = req.body;
            console.log(product);
            const result = await productsCollection.insertOne(product);
            res.send(result);
        });

        //get product details
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const product = await productsCollection.find(query).toArray();
            res.send(product);
        });

        //delete product
        app.delete("/products/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await productsCollection.deleteOne(filter);
            res.send(result);
        });

    } finally {
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("UTech server is running");
});

app.listen(port, () => {
    console.log(`UTech is running on port ${port}`);
});
