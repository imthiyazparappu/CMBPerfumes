var db=require('../config/connection')
const collection=require('../config/collections');
const { ObjectId } = require('mongodb');
const { response } = require('express');
var objectId=require('mongodb').ObjectId

module.exports={
    addProduct:(product,callback)=>{
        db.get().collection('product').insertOne(product).then((data)=>{
            console.log(data);
            callback(data.insertedId)
        })
    },
    getAllProducts:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },

    updateProduct:(proId,proDeatails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    name:proDeatails.name,
                    category:proDeatails.category,
                    price:proDeatails.price,
                    descreption:proDeatails.descreption
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
}