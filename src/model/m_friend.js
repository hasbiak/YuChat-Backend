const connection = require("../config/mysql");

module.exports = {
  getFriendById: (id, search) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT user.user_id, user.user_name, user.user_email, user.user_about, user.user_phone, user.user_image, user.user_lat, user.user_lng FROM friendlist JOIN user on friendlist.friend_id = user.user_id WHERE friendlist.user_id = ? AND user.user_name LIKE ? ORDER BY user.user_name ASC",
        [id, `%${search}%`],
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error));
        }
      );
    });
  },
  postFriend: (addData) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO friendlist SET ?",
        addData,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error));
        }
      );
    });
  },
  deleteFriend: (userId, friendId) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "DELETE from friendlist WHERE user_id = ? AND friend_id = ?",
        [userId, friendId],
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error));
        }
      );
    });
  },
};
