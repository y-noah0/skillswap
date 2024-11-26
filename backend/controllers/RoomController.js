const RoomModel = require('../models/RoomModel')

const createRoom = async (req, res) => {
    const {skillId,senderId} = req.body
    try {
        const roomExists = await RoomModel.find({ skillId: skillId })
        if (roomExists) {
            const newArray = roomExists.members
            newArray.push(skillId)
            const updateRoom = await RoomModel.findOneAndUpdate({
              skillId: skillId,
            },{members:newArray});
        }
    const newRoom = new RoomModel({
      skillId,
    members: [senderId],
  });

    const result = await newRoom.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};
