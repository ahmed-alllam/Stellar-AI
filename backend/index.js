const express = require("express");
const app = express();

// Body Parser
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true , limit: '50mb'}));

// API Routes
const searchRoute = require("./routes/search");
app.use('/', searchRoute);

const summarizeRoute = require("./routes/summarize");
app.use('/', summarizeRoute);

app.get("/", (req, res) => {
  res.send("Ok");
});

app.enable('trust proxy')
app.use((req, res, next) => {
    req.secure ? next() : res.redirect('https://' + req.headers.host + req.url)
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Server is running on port " + port);
});
