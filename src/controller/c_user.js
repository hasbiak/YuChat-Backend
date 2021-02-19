const {
  getUserById,
  checkUser,
  postUser,
  checkKey,
  changeData,
  patchUser,
} = require("../model/m_user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const helper = require("../helper");
const nodemailer = require("nodemailer");
const fs = require("fs");

module.exports = {
  getUserById: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await getUserById(id);
      return helper.response(response, 200, "Success Get User By Id", result);
    } catch (error) {
      return helper.response(response, 400, "Bad Request");
    }
  },
  getUserByEmail: async (request, response) => {
    try {
      const { email } = request.params;
      const result = await checkUser(email);
      if (result.length >= 1) {
        delete result[0].user_password;
        delete result[0].user_key;
        delete result[0].user_status;
        delete result[0].user_created_at;
        delete result[0].user_updated_at;
      }
      return helper.response(
        response,
        200,
        "Get User by Email Success",
        result
      );
    } catch (error) {
      return helper.response(response, 400, "Bad Request");
    }
  },
  registerUser: async (request, response) => {
    const { user_name, user_email, user_password } = request.body;
    const salt = bcrypt.genSaltSync(10);
    const encryptPass = bcrypt.hashSync(user_password, salt);
    const addUser = {
      user_name,
      user_email,
      user_password: encryptPass,
      user_image: "blank-profile.png",
      user_phone: "",
      user_about: "",
      user_lat: "",
      user_lng: "",
      user_activity: 0,
      user_status: 0,
      user_key: 0,
      user_created_at: new Date(),
    };
    try {
      const checkEmail = await checkUser(user_email);
      if (checkEmail.length >= 1) {
        return helper.response(response, 400, "Email has been Registered");
      } else if (user_name === "" || user_name === undefined) {
        return helper.response(response, 400, "Name is Required !");
      } else if (user_email === "" || user_email === undefined) {
        return helper.response(response, 400, "Email is required !");
      } else if (user_email.search("@") < 1) {
        return helper.response(response, 400, "Email not Valid");
      } else if (user_password === "" || user_password === undefined) {
        return helper.response(response, 400, "Password is required !");
      } else if (user_password.length < 8) {
        return helper.response(response, 400, "Minimum password 8 character");
      } else {
        const result = await postUser(addUser);
        return helper.response(
          response,
          200,
          "Register is Success, Activate your Account !",
          result
        );
      }
    } catch (error) {
      console.log(result);
      return helper.response(response, 400, "Bad Request");
    }
  },
  loginUser: async (request, response) => {
    const { user_email, user_password } = request.body;
    if (user_email === undefined || user_email === "") {
      return helper.response(response, 400, "Email is Required");
    } else if (user_password === undefined || user_password === "") {
      return helper.response(response, 400, "Password is Required");
    }
    try {
      const checkData = await checkUser(user_email);
      if (checkData.length >= 1) {
        const checkPass = bcrypt.compareSync(
          user_password,
          checkData[0].user_password
        );
        if (checkPass) {
          const {
            user_id,
            user_name,
            user_email,
            user_password,
            user_status,
            user_phone,
            user_lat,
            user_lng,
            user_image,
            user_about,
          } = checkData[0];
          let payload = {
            user_id,
            user_name,
            user_email,
            user_password,
            user_status,
            user_phone,
            user_lat,
            user_lng,
            user_image,
            user_about,
          };
          if (payload.user_status === 0) {
            return helper.response(
              response,
              400,
              "Please Activate Your Account, check your email"
            );
          } else {
            const token = jwt.sign(payload, "YUCHAT", { expiresIn: "6h" });
            payload = { ...payload, token };
            return helper.response(response, 200, "Success Login", payload);
          }
        } else {
          return helper.response(response, 400, "Wrong Password !");
        }
      } else {
        return helper.response(response, 400, "Email is not Registered !");
      }
    } catch (error) {
      return helper.response(response, 400, "Bad Request");
    }
  },
  logout: async (req, res) => {
    const { id } = req.params;
    try {
      const setData = {
        user_activity: 0,
        user_updated_at: new Date(),
      };
      const result = await patchUser(setData, id);
      return helper.response(res, 201, "Status Updated", result);
    } catch (err) {
      return helper.response(res, 400, "Bad Request", err);
    }
  },
  sendEmailActivation: async (request, response) => {
    const { user_email } = request.body;
    const keys = Math.round(Math.random() * 1000000);
    try {
      const checkData = await checkUser(user_email);
      if (checkData.length >= 1) {
        const data = {
          user_key: keys,
          user_updated_at: new Date(),
        };
        await changeData(data, user_email);
        const transporter = nodemailer.createTransport({
          service: "gmail",
          port: 587,
          secure: false,
          auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASS,
          },
        });
        await transporter.sendMail({
          from: `"Yu Chat "${process.env.USER_EMAIL}`,
          to: user_email,
          subject: "Yu-Chat - Activation Email",
          text: "Lets, Activation Your Account, and lets chatting",
          html: `<a href="https://yuchat.netlify.app/activation-account?keys=${keys}">Click Here To Activation Your Account</a>`,
        }),
          function (error) {
            if (error) {
              return helper.response(response, 400, "Email is not Sent !");
            }
          };
        return helper.response(response, 200, "Email has been Sent !");
      } else {
        return helper.response(response, 400, "Email is not Registered !");
      }
    } catch (error) {
      return helper.response(response, 400, "Bad Request", error);
    }
  },
  activationAccount: async (request, response) => {
    const { keys } = request.query;
    try {
      const checkData = await checkKey(keys);
      if (
        request.query.keys === undefined ||
        request.query.keys === null ||
        request.query.keys === ""
      ) {
        return helper.response(response, 400, "Invalid Key");
      }
      if (checkData.length > 0) {
        const email = checkData[0].user_email;
        let setData = {
          user_key: "",
          user_status: 1,
          user_updated_at: new Date(),
        };
        const result = await changeData(setData, email);
        return helper.response(
          response,
          200,
          "Your Account is Activated",
          result
        );
      } else {
        return helper.response(response, 400, "Invalid key");
      }
    } catch (error) {
      return helper.response(response, 404, "Bad Request", error);
    }
  },
  sendEmailForgotPassword: async (request, response) => {
    try {
      const { user_email } = request.body;
      const keys = Math.round(Math.random() * 1000000);
      const checkData = await checkUser(user_email);
      if (checkData.length >= 1) {
        const data = {
          user_key: keys,
          user_updated_at: new Date(),
        };
        await changeData(data, user_email);
        const transporter = nodemailer.createTransport({
          service: "gmail",
          port: 587,
          secure: false,
          auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASS,
          },
        });
        await transporter.sendMail({
          from: `"Yu Chat "${process.env.USER_EMAIL}`,
          to: user_email,
          subject: "Yu-Chat - Forgot Password",
          text: "Save your Password !",
          html: `<a href="https://yuchat.netlify.app/new-password?keys=${keys}">Click Here To Change Your Password</a>`,
        }),
          function (error) {
            if (error) {
              return helper.response(response, 400, "Email not Sent !");
            }
          };
        return helper.response(response, 200, "Email has been Sent");
      } else {
        return helper.response(response, 400, "Email is not Registered !");
      }
    } catch (error) {
      return helper.response(response, 400, "Bad Request");
    }
  },
  changePassword: async (request, response) => {
    try {
      const { keys } = request.query;
      const { user_password } = request.body;
      const checkData = await checkKey(keys);
      if (
        request.query.keys === undefined ||
        request.query.keys === "" ||
        request.query.keys === null
      ) {
        return helper.response(response, 400, "Invalid Key");
      }
      if (checkData.length >= 1) {
        const email = checkData[0].user_email;
        let setData = {
          user_key: keys,
          user_password,
          user_updated_at: new Date(),
        };
        const limit = setData.user_updated_at - checkData[0].user_updated_at;
        const timeLimit = Math.floor(limit / 1000 / 60);
        if (timeLimit > 5) {
          const resetData = {
            user_key: "",
            user_updated_at: new Date(),
          };
          await changeData(resetData, email);
          return helper.response(response, 400, "Key Expired");
        } else if (
          request.body.user_password === undefined ||
          request.body.user_password === "" ||
          request.body.user_password === null
        ) {
          return helper.response(response, 400, "Password  is Required !");
        } else if (
          request.body.confirm_password === undefined ||
          request.body.confirm_password === "" ||
          request.body.confirm_password === null
        ) {
          return helper.response(
            response,
            400,
            "Confirm Password  is Required !"
          );
        } else if (request.body.user_password.length < 8) {
          return helper.response(response, 400, "input 8 minimum character !");
        } else if (
          request.body.user_password !== request.body.confirm_password
        ) {
          return helper.response(response, 400, "Password not match !");
        } else {
          const salt = bcrypt.genSaltSync(10);
          const encryptPass = bcrypt.hashSync(user_password, salt);
          setData.user_password = encryptPass;
          setData.user_key = "";
        }
        const result = await changeData(setData, email);
        return helper.response(
          response,
          200,
          "Success Change Password !",
          result
        );
      } else {
        return helper.response(response, 400, "Invalid key");
      }
    } catch (error) {
      return helper.response(response, 400, "Bad Request");
    }
  },
  patchUser: async (request, response) => {
    try {
      const { id } = request.params;
      const { user_name, user_about, user_phone } = request.body;
      if (
        user_name === "" ||
        user_name === undefined ||
        user_about === "" ||
        user_about === undefined ||
        user_phone === "" ||
        user_phone === undefined
      ) {
        return helper.response(response, 400, "Data not complete");
      } else if (user_phone.length < 8) {
        return helper.response(response, 400, "Phone minimum 8 character");
      } else {
        const checkUser = await getUserById(id);
        if (checkUser.length >= 1) {
          const setData = {
            user_name,
            user_about,
            user_phone,
            user_updated_at: new Date(),
          };
          const result = await patchUser(setData, id);
          return helper.response(response, 201, "User Updated", result);
        } else {
          return helper.response(response, 404, "User Not Found");
        }
      }
    } catch (error) {
      return helper.response(response, 400, "Bad Request", error);
    }
  },
  patchImageUser: async (request, response) => {
    try {
      const { id } = request.params;
      const setData = {
        user_image: request.file.filename,
      };
      const checkUser = await getUserById(id);
      if (checkUser.length > 0) {
        if (
          checkUser[0].user_image === "blank-profile-pic.png" ||
          checkUser[0].user_image === "" ||
          request.file == undefined
        ) {
          const result = await patchUser(setData, id);
          return helper.response(response, 200, "Profile Updated", result);
        } else {
          fs.unlink(`./uploads/${checkUser[0].user_image}`, async (error) => {
            if (error) {
              throw error;
            } else {
              const result = await patchUser(setData, id);
              return helper.response(response, 201, "Profile Updated", result);
            }
          });
        }
      } else {
        return helper.response(response, 404, "User Not Found");
      }
    } catch (error) {
      return helper.response(response, 400, "Bad Request", error);
    }
  },
  patchMaps: async (request, response) => {
    try {
      const { id } = request.params;
      const { user_lat, user_lng } = request.body;
      const setData = {
        user_lat,
        user_lng,
        user_updated_at: new Date(),
      };
      const result = await patchUser(setData, id);
      return helper.response(response, 200, "Location Update", result);
    } catch (error) {
      return helper.response(response, 400, "Bad Request", error);
    }
  },
  patchActivity: async (request, response) => {
    try {
      const { id } = request.params;
      const { user_activity } = request.body;
      const setData = {
        user_activity,
        user_updated_at: new Date(),
      };
      const result = await patchUser(setData, id);
      return helper.response(response, 200, "Status Activity Updated", result);
    } catch (error) {
      return helper.response(response, 400, "Bad Request", error);
    }
  },
};
