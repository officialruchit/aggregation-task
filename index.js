const express = require("express");
const app = express();
const port = 3000;

const dbconnection = require("./config/db");
dbconnection();
const accomdationRoute = require("./routes/accomdationRoute");
const listRoute = require("./routes/listingRoute");
app.use("/listing-data", listRoute);
app.use("/api", accomdationRoute);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
