import RoomModel from "../Models/room.model";

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
