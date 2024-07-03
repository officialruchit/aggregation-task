const express = require("express");
const app = express();
const port = 3000;

const dbconnection = require("./config/db");
dbconnection();

const listRoute=require('./routes/listingRoute')
app.use('/listing-data',listRoute)

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
