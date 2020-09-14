//importing
// import express from "express";
const express = require("express");
const mongoose = require("mongoose");
const Messages = require("./Messages.js");
const Pusher = require("pusher");
const cors = require("cors"); //for cors origin

//app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1071906",
  key: "bde0f3674fd52f1121be",
  secret: "3be5e851dcc4a09108e5",
  cluster: "us2",
  encrypted: true,
});

//middleware
app.use(express.json()); //Send data back from server in json format

// app.use((req, res, next) => {
//   //Same as allwoing cros origin on the app as mam taught       //app.use(cors);  //it can also be used instead of 4 code line
//   //   res.setHeader("Accss-Control-Allow-Origin", "*");
//   res.setHeader("Accss-Control-Allow-Headers", "*");
//   next();
// });
app.use(cors());

//db config
const connectionUrl =
  "mongodb+srv://simran:simran@cluster0.bhuqf.mongodb.net/whatsappCloneDB?retryWrites=true&w=majority";

mongoose.connect(connectionUrl, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => {
  console.log("db connected");

  const msgCollection = db.collection("messages"); //this collection name is same as what in mongodbconsole
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log("A Change occued", change);

    //checking if new change in stream is due to 'insert' then the will be triggering pusher
    //hence forward pusher will be triggering frontnd to reflect this new change
    if (change.operationType === "insert") {
      const newMessageToPusher = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        //here above 'messages' is channel on which frontend willl get connected throgh pusher
        //ANd 'inserted' is action
        //below fields are just for console logging on pusher website to reflect the ongoing process
        name: newMessageToPusher.name,
        message: newMessageToPusher.message,
        timestamp: newMessageToPusher.timestamp,
        received: newMessageToPusher.received,
        _id: newMessageToPusher._id,
      });
    } else {
      console.log("Error at pusher");
    }
  });
});

//??????

// api routes
app.get("/", (req, res) => res.status(200).send("hello world"));

app.get("/messages/getAll", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

//listen
app.listen(port, () => console.log(`Listening at localhost: ${port}`));
