const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config");
const authRoutes = require("./routes/auth");
const noteRoutes = require("./routes/notes");
const dotenv = require("dotenv");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
