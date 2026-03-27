const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

// File handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

// AWS config
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Upload route
app.post("/upload", upload.single("file"), async (req, res) => {
  console.log("Upload route hit");

  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: Date.now() + "-" + file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  try {
    const data = await s3.upload(params).promise();
    res.json({
      message: "Uploaded successfully",
      url: data.Location
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Server is working");
});
app.listen(5000, () => console.log("Server running on port 5000"));
