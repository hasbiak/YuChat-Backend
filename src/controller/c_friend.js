const {
  getFriendById,
  postFriend,
  deleteFriend,
} = require("../model/m_friend");
const helper = require("../helper/index");

module.exports = {
  getFriendById: async (request, response) => {
    try {
      const { id } = request.params;
      let { search } = request.query;
      if (search === undefined) {
        search = "";
      }
      const result = await getFriendById(id, search);
      return helper.response(response, 200, "get Friend Success", result);
    } catch (error) {
      return helper.response(response, 400, "Bad Request", error);
    }
  },
  postFriend: async (request, response) => {
    try {
      const { user_id, friend_id } = request.body;
      const addData = {
        user_id,
        friend_id,
        friendlist_created_at: new Date(),
      };
      const result = await postFriend(addData);
      return helper.response(response, 200, "Add Friend Success", result);
    } catch (error) {
      return helper.response(response, 400, "Bad Request", error);
    }
  },
  deleteFriend: async (request, response) => {
    try {
      const { user_id, friend_id } = request.query;
      await deleteFriend(user_id, friend_id);
      return helper.response(response, 200, "Delete Friend Success");
    } catch (error) {
      return helper.response(response, 400, "Bad Request", error);
    }
  },
};
