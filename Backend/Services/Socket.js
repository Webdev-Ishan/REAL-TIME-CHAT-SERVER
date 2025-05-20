import User from "./Models/user.Model.js";
import messageModel from "./Models/messages.model.js";
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

export const Livechat = async () => {
  io.on("connection", (socket) => {
    socket.on("new-user", async () => {
      let members = await User.find({});
      io.emit("new-member", members);
    });

    socket.on("create-room", async (roomname, socket, creator) => {
      let already = await RoomModel.findone(roomname);
      if (already) {
        socket.emit("Error-room", "Room of this name already exists");
      }

      let newroom = await RoomModel.create({
        name: roomname,
        created_by: creator,
        members: socket,
      });

      socket.join(newroom);
      socket.emit(
        "confirm",
        "The new room has created and you are joined in it."
      );
    });

    socket.on("join-room", async (newroom, previousroom) => {
      if (newroom === previousroom) {
        socket.leave(previousroom);
      }

      socket.join(newroom);
      let previouschat = await getlastmessages(newroom);
      let roomMessages = sortRoomMessagesByDate(previouschat);
      socket.emit("room-messages", roomMessages);
    });

    socket.on("message-room", async (room, sender, time, date, content) => {
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
  });
};
