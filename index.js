const express = require('express');
const dotenv = require('dotenv');
const app = express();
const port = process.env.port;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});