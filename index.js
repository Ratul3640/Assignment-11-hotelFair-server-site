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
