const db = require("../config/connection");
const bcrypt = require("bcrypt");
const { response } = require("express");
const { ADMIN_COLLECTION } = require("../config/collections");
var objectId = require("mongodb").ObjectId;
var collection = require("../config/collections");
const { ObjectID } = require("bson");
const router = require("../routes/admin");

module.exports = {
  adminSignup: (adminData) => {
    return new Promise(async (resolve, reject) => {
      adminData.Password = await bcrypt.hash(adminData.Password, 10);
      db.get()
        .collection(collection.ADMIN_COLLECTION)
        .insertOne(adminData)
        .then(() => {
          console.log(adminData, "adminData");
          resolve(adminData);
        });
    });
  },

  adminLogin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let admin = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ email: adminData.Email });
      if (admin) {
        bcrypt.compare(adminData.Password, admin.Password).then((status) => {
          if (status) {
            (response.admin = admin), (response.status = true);
            response.admin = admin;
            response.status = true;
            resolve(response);
            console.log("login Success");
            resolve(response);
          } else {
            console.log("loginFailed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("loginFailed");
        resolve({ status: false });
      }
    });
  },

  getAllUsers: (userId) => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_C0LLECTION)
        .find()
        .toArray();
      resolve(users);
      console.log(users);
    });
  },

  getOrders: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .toArray();
      resolve(orders);
    });
  },

  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ]).toArray();
      console.log(orderItems,"orderItems=============");
      resolve(orderItems);
    });
  },
};
