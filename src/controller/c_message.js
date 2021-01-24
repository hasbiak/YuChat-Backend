const { getMessageByRoomId, postMessage } = require("../model/m_message");
const { patchRoom } = require("../model/m_message");
const helper = require("../helper/index");

module.exports = {
  getMessageByRoomId: async (request, response) => {
    try {
      const { room_id, user_id } = request.query;
      const result = await getMessageByRoomId(room_id);
      for (let i = 0; i < result.length; i++) {
        if (parseInt(result[i].user_id) === parseInt(user_id)) {
          result[i].class = "receiver";
        } else {
          result[i].class = "sender";
        }
      }
      return helper.response(response, 200, "Get Room Success", result);
    } catch (error) {
      return helper.response(response, 400, "Bad Request");
    }
  },
  sendMessage: async (request, response) => {
    try {
      const { room_id, user_id, message } = request.body;
      const setData = {
        room_id,
        user_id,
        message,
        message_created_at: new Date(),
      };
      await postMessage(setData);
      const setDataRoom = {
        room_updated_at: new Date(),
      };
      await patchRoom(setDataRoom, room_id);
      return helper.response(response, 200, "Success Send Message");
    } catch (error) {
      return helper.response(response, 400, "Bad Request");
    }
  },
};
