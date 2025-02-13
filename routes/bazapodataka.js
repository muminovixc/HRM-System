const express = require('express');
const pg = require('pg');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const http=require('http')
const url = require('url');
const app = express();
const port = 3000;
require('dotenv').config();

// Parsiranje JSON podataka
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname)));
app.use(cors());
// Konekcija na bazu



const config = {
    user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.DB_SSL_CERTIFICATE,
    },
};

const pool = new pg.Pool(config);



module.exports={pool}