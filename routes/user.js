const { response } = require("express");
var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
const verifyLogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  console.log(req.session.user);
  let user = req.session.user;
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }

  productHelpers.getAllProducts().then((products) => {
    res.render("user/view-products", { products, user, cartCount});
    console.log(cartCount);
  });
});

router.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/login", { "loginErr": req.session.userLoginErr });
    req.session.userLoginErr = false;
  }
});

router.get("/signup", (req, res) => {
  res.render("user/signup");
  req.session.user = response;
  req.session.user.loggedIn;
});

router.post("/signup", (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    res.redirect("/");
    console.log(response);
  });
});

router.post("/login", (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {

    if (response.status) {
      req.session.user = response.user;
      req.session.user.loggedIn = true;
      res.redirect("/");
    } else {
      req.session.userLoginErr = true;
      res.redirect("/login");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.user=null
  res.redirect("/");
});

router.get("/cart", verifyLogin, async (req, res) => {
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  let products = await userHelpers.getCartProducts(req.session.user._id);
  console.log(products);
  res.render("user/cart", { products, user: req.session.user,total });
});

router.get("/add-to-cart/:id", (req, res) => {
  console.log("api call");
  console.log(req.params.id, req.session.user._id);
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({status:true})
  });
});

router.post("/change-product-quantity",(req,res,next)=>{
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
});

router.post('/remove-product',(req,res)=>{
  userHelpers.removeProduct(req.body).then(async(response)=>{
      res.json(response)  

   })
});

router.get("/place-order",verifyLogin, async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render("user/place-order",{total,user: req.session.user,total})
});

router.post("/place-order",async(req,res)=>{
  let products=await userHelpers.getCartProList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    console.log(orderId, '******************');
    if(req.body['payment-method']==='cod'){
      console.log(products,totalPrice,req.body, '=================');
      res.json({codSuccess:true}) 
    }else{
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response)
        console.log(response,"===res===");
      })
    }
  })
});

router.get("/order-success",(req,res)=>{
  res.render("user/order-success",{user:req.session.user})
});

router.get("/orders",async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  res.render("user/orders",{user:req.session.user,orders})
});

router.get("/view-orders/:id",async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  res.render("user/view-orders",{user:req.session.user,products})
})

router.post('/verify-payment',(req,res)=>{
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log('Payment succesful');
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err);
    res.json({status:false})
  })
})
module.exports = router;
