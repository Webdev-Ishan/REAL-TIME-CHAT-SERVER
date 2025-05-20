import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  from: {
    type: Object,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  Socketid: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
  },
});

const messageModel = new mongoose.model("Message", messageSchema);

export default messageModel;
