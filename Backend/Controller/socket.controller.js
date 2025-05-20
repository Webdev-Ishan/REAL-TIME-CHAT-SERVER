import RoomModel from "../Models/room.model";
import messageModel from "../Models/messages.model";

export const findRoom = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.json({
      success: false,
      message: "Name is required to find the room",
    });
  }

  try {
    let already = await RoomModel.findone(name);
    if (!already) {
      return res.json({
        success: false,
        message: "Room of this name does not exists, want to create one.",
      });
    }

    return res.json({
      success: true,
      already,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  const { id } = req.body;
  const { creator_id } = req.creator;

  if (!id || !creator_id) {
    return res.json({
      success: false,
      message: "Id is required to delete the message.",
    });
  }

  try {
    let messageInfo = await messageModel.findById(id);
    if (!messageInfo) {
      return res.json({
        success: false,
        message: "Message not found.",
      });
    }

    if (messageInfo.from.toString() !== creator_id.toString()) {
      return res.json({
        success: false,
        message: "You can delte only your messages",
      });
    }

    let deleted = await messageModel.findByIdAndDelete(id);

    if (deleted) {
      return res.json({
        success: true,
        message: "Message deleted successfully",
      });
    }
    return res.json({ success: false, message: "Something went wrong" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
