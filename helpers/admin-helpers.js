var db=require('../config/connection')
const collection=require('../config/collections');
const { ObjectId } = require('mongodb');
let bcrypt = require('bcrypt')
const { response } = require('express');
var objectId=require('mongodb').ObjectId

module.exports={
    doAdminSignup: (adminData) => {
        return new Promise(async (resolve, reject) => {
          adminData.Password = await bcrypt.hash(adminData.Password, 10);
          db.get()
            .collection(collection.ADMIN_COLLECTION)
            .insertOne(adminData)
            .then(() => {
              console.log(adminData,"adminData=");
              resolve(adminData);
            });
        });
      },
    
      doAdminLogin: (adminData) => {
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
                console.log("login success");
                response.admin = admin;
                response.status = true;
                resolve(response);
              } else {
                console.log("login failed");
                resolve({ status: false });
              }
            });
          } else {
            console.log("login failed");
            resolve({ status: false });
          }
        });
      },
    

}