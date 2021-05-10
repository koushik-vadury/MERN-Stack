const mongoose = require("mongoose");

var mongoDB = process.env.DB_HOST;
mongoose
  .connect(mongoDB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected Mongodb");
  })
  .catch((error) => {
    console.log(error.message);
  });
