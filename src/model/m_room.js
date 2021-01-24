const connection = require("../config/mysql");

module.exports = {
  getRoomByUserId: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM room WHERE user_id = ? ORDER BY room_updated_at DESC",
        id,
        (error, response) => {
          !error ? resolve(response) : reject(new Error(error));
        }
      );
    });
  },
  getRoomByRoomId: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT room.room_id, room.user_id, room.room_updated_at, user.user_name, user.user_image, user.user_activity FROM room JOIN user ON room.user_id = user.user_id WHERE room.room_id = ? ORDER BY room.room_updated_at DESC",
        id,
        (error, response) => {
          !error ? resolve(response) : reject(new Error(error));
        }
      );
    });
  },
  postRoom: (addData) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO room SET ?", addData, (error, response) => {
        !error ? resolve(response) : reject(new Error(error));
      });
    });
  },
  getLastMessage: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT message.room_id, message.user_id, message.message, message.message_created_at, user.user_name FROM message JOIN user ON message.user_id = user.user_id WHERE message.room_id = ? ORDER BY message.message_created_at DESC LIMIT 1",
        id,
        (error, result) => {
          !error ? resolve(result[0]) : reject(new Error(error));
        }
      );
    });
  },
  searchRoom: (id, search) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT room.room_id, room.user_id, room.room_updated_at, user.user_name, user.user_image FROM room JOIN user ON room.user_id = user.user_id WHERE room.room_id = ? AND user.user_name LIKE ? ORDER BY room.room_updated_at DESC",
        [id, `%${search}%`],
        (err, res) => {
          !err ? resolve(res) : reject(new Error(err));
        }
      );
    });
  },
  patchRoom: (setData, id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "UPDATE room SET ? WHERE room_id = ?",
        [setData, id],
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error));
        }
      );
    });
  },
};
