import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const RoomModel = new mongoose.model("Room", roomSchema);

export default RoomModel;
