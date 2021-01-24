const connection = require("../config/mysql");

module.exports = {
  getMessageByRoomId: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT message.room_id, message.user_id, message.message, message.message_created_at, user.user_name FROM message JOIN user ON message.user_id = user.user_id WHERE room_id = ?",
        id,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error));
        }
      );
    });
  },
  postMessage: (addData) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO message SET ?",
        addData,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error));
        }
      );
    });
  },
};
