const express = require("express");
const app = express();

const server = app.listen(3000, () => {
  console.log(`App listening on port ${server.address().port}`);
});

app.use("/assets", express.static("assets"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
