const express = require('express');
const { MongoClient, Collection } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.skciu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('best-bikes');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');

        // GET Products API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        // POST Products API
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result);
        })

        // DELETE Products API
        app.delete('/products', async (req, res) => {
            const id = req.body.id;
            const query = {_id:ObjectId(id)};
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        })

        // POST Orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        })

        // GET Orders API
        app.get('/orders', async (req, res) => {
            const userEmail = req.query.email;
            const query = userEmail ? {userEmail} : {};
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        })

        // DELETE Orders API
        app.delete('/orders', async (req, res) => {
            const id = req.body.id;
            const query = {_id:ObjectId(id)};
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

        // POST Users API
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })

        // PUT Admin API
        app.put('/users', async (req, res) => {
            const email = req.body.email;
            const filter = {email};
            const updateDoc = {$set: {role: 'admin'}};
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // GET Admin API
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = {email};
            let isAdmin = false;
            const user = await usersCollection.findOne(query);
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({admin: isAdmin})
        })







    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Best Bikes')
})

app.listen(port, () => {
    console.log('listening to port:', port);
})