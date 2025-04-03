const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require('cors');

const app = express();
const dotenv = require('dotenv');
const allRoutes = require('./routes/routes');

// Setting up config.env file variables
dotenv.config({path: './config/.env'})

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

// Set up body parser
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', allRoutes);

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
    console.log(`Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`)
});