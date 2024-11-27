const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const app = express()
const port = process.env.PORT || 5000



// midlleware 

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};


app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://hotel-fair.web.app',
        'https://b9a11hotelfairs.netlify.app',
        'https://hotel-fair-crud.vercel.app'
    ],
    credentials: true,
    optionsSuccessStatus: 200,
}))
app.use(express.json())
app.use(cookieParser())

const logger = (req, res, next) => {
    next()
}

const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token
    if (!token) {
        return res.status(401).send({ message: 'unathorized access' })
    }
    if (token) {
        jwt.verify(token, process.env.DB_ACCESS_TOKEN, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: 'unathorized access' })
            }
            req.user = decoded
            next()
        })
    }
}




const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.kmaa4nd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        const roomsCollection = client.db('OurRooms').collection('rooms')
        const myRoomsCollection = client.db('OurRooms').collection('myRooms')
        const rewviewCollection = client.db('OurRooms').collection('reviews')

        app.post("/jwt", logger, async (req, res) => {
            const user = req.body;
            console.log("user for token", user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

            res.cookie("token", token, cookieOptions).send({ success: true });
        });

        app.post("/logout", async (req, res) => {
            res
                .clearCookie("token", { ...cookieOptions, maxAge: 0 })
                .send({ success: true });
        });
