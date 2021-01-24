const helper = require("../helper/index");
const {
  getRoomByUserId,
  getRoomByRoomId,
  postRoom,
  searchRoom,
  getLastMessage,
} = require("../model/m_room");

module.exports = {
  createRoom: async (request, response) => {
    try {
      const roomId = Math.round(Math.random() * 1000000);
      const addData = {
        room_id: roomId,
        user_id: request.body.user_id,
        room_created_at: new Date(),
      };
      await postRoom(addData);
      const addData2 = {
        room_id: roomId,
        user_id: request.body.friend_id,
        room_created_at: new Date(),
      };
      await postRoom(addData2);
      return helper.response(response, 200, "Room Created", roomId);
    } catch (error) {
      return helper.response(response, 400, "Bad Request");
    }
  },
  getRoomByUserId: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await getRoomByUserId(id);
      const roomIds = result.map((value) => {
        return value.room_id;
      });
      let newResult = [];
      for (let i = 0; i < roomIds.length; i++) {
        result2 = await getRoomByRoomId(roomIds[i]);
        const result3 = result2.filter(
          (value) => value.user_id !== parseInt(id)
        );
        newResult = newResult.concat(result3);
        for (let i = 0; i < newResult.length; i++) {
          newResult[i].recent = await getLastMessage(newResult[i].room_id);
        }
      }
      return helper.response(response, 200, "Get Room Success", newResult);
    } catch (error) {
      return helper.response(response, 400, "Bad Request");
    }
  },
  searchRoom: async (request, response) => {
    try {
      const { id, search } = request.query;
      const result = await getRoomByUserId(id);
      const roomIds = result.map((val) => {
        return val.room_id;
      });
      let result4 = [];
      for (let i = 0; i < roomIds.length; i++) {
        result2 = await searchRoom(roomIds[i], search);
        const result3 = result2.filter((val) => val.user_id !== parseInt(id));
        result4 = result4.concat(result3);
        for (let i = 0; i < result4.length; i++) {
          result4[i].recent = await getLastMessage(result4[i].room_id);
        }
      }
      return helper.response(response, 200, "Get Room Success", result4);
    } catch (error) {
      return helper.response(response, 400, "Bad Request");
    }
  },
};
