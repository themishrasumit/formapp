const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve index.html
app.use('/uploads', express.static('uploads')); // Serve uploaded images

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB limit
});

// Create uploads folder if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Serve form HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "indexx.html"));
});

// Handle form submission
app.post("/submit", upload.single("profilePic"), (req, res) => {
  const { name, dob, phone } = req.body;
  const file = req.file;

  if (!file) {
    return res.send("❌ File upload failed or file too large (max 1 MB).");
  }

  const data = `Name: ${name}, DOB: ${dob}, Phone: ${phone}, File: ${file.filename}\n`;
  console.log("Form Submission =>", data);

  fs.appendFile("submissions.txt", data, (err) => {
    if (err) {
      return res.send("❌ Error saving data.");
    }
    res.send(`
      <h2>✅ Uploaded Successfully</h2>
      <p>Name: ${name}</p>
      <p>DOB: ${dob}</p>
      <p>Phone: ${phone}</p>
      <img src="/uploads/${file.filename}" width="200" />
    `);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
