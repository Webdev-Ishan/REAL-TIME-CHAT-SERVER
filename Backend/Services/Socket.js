import User from "../Models/user.Model.js";
import messageModel from "../Models/messages.model.js";
import RoomModel from "../Models/room.model.js";

// to find the messages by the room and fetch thme according to date
const getlastmessages = async (room) => {
  let messages = await messageModel.aggregate([
    { $match: { to: room } },
    { $group: { _id: "$date", messagesByDate: { $push: "$$ROOT" } } },
  ]);

  return messages;
};

// arrnge them according to the date
function sortRoomMessagesByDate(messages) {
  return messages.sort(function (a, b) {
    let date1 = a._id.split("/");
    let date2 = b._id.split("/");

    date1 = date1[2] + date1[0] + date1[1];
    date2 = date2[2] + date2[0] + date2[1];

    return date1 < date2 ? -1 : 1;
  });
}

export const Livechat = async (io) => {
  io.on("connection", (socket) => {
    console.log(socket.id);
    socket.on("new-user", async () => {
      let members = await User.find({});
      io.emit("new-member", members);
    });

    socket.on("create-room", async (roomname, creator, userId) => {
      let already = await RoomModel.findOne({ name: roomname });
      if (already) {
        socket.emit("Error-room", "Room of this name already exists");
        return;
      }

      let newroom = await RoomModel.create({
        name: roomname,
        created_by: creator,
        members: [userId],
      });

      socket.join(newroom.name);

      socket.emit(
        "confirm",
        "The new room has created and you are joined in it."
      );
    });

    socket.on("join-room", async (newroom, previousroom, userId) => {
      if (previousroom == newroom) {
        socket.leave(previousroom);
      }

      socket.join(newroom);
      await RoomModel.updateOne(
        { name: newroom },
        { $addToSet: { members: userId } }
      );

      let previouschat = await getlastmessages(newroom);
      let roomMessages = sortRoomMessagesByDate(previouschat);
      socket.emit("room-messages", roomMessages);
    });

    socket.on("message-room", async (room, sender, time, date, content) => {
      let senderid = await RoomModel.findOne({ name: room });

      if (!senderid) {
        socket.emit(
          "error-message",
          "You are not a valid person to send message"
        );
        return;
      }

      let newMessage = await messageModel.create({
        from: sender,
        time,
        date,
        content,
        to: room,
      });
      let previouschat = await getlastmessages(room);
      let roomMessages = sortRoomMessagesByDate(previouschat);

      io.to(room).emit("room-messages", roomMessages);
      socket.broadcast.emit("notifications", room);
    });

    socket.on("disconnect", async (userid) => {
      await RoomModel.updateMany({}, { $pull: { members: userid } });
      console.log(`Socket ${socket.id} disconnected`);
    });
  });
};
