const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')
var adminHelpers=require('../helpers/admin-helpers')
const verifyLogin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/login");
  }
};


/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
    console.log(products);
    res.render("admin/view-products",{admin:true, products})
  })
});

router.get('/add-product',(req,res)=>{
  res.render('admin/add-product')
})

router.post('/add-product',(req,res)=>{
  productHelpers.addProduct(req.body,(id)=>{
    let image=req.files.image
    image.mv("./public/product-images/"+id+".jpg",(err,done)=>{
      if (!err){
        res.render("admin/add-product")
      }
    })
  })
})

router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })
})

router.get('/edit-product/:id',async(req,res)=>{
  let product=await productHelpers.getProductDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product',{product})
})

router.post('/edit-product/:id',(req,res)=>{
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if (req.files.image){
      let image=req.files.image
      let id=req.params.id
      image.mv("./public/product-images/"+id+".jpg")
    }
  })
})


//******************login page for admin****************//
router.get("/login", (req, res) => {
  if (req.session.admin) {
    res.redirect("admin/view-products");
  } else {
    res.render("admin/login", {  LoginErr: req.session.LoginErr,});
    req.session.LoginErr = false;
  }
});

router.get("/signup", (req, res) => {
  res.render("admin/signup");
  req.session.admin = response;
  req.session.adminLoggedIn;
});

router.post("/signup", (req, res) => {
  console.log(req.body,"=========////");
  adminHelpers.doAdminSignup(req.body).then((response) => {
    res.redirect("admin/login");
    console.log(response);
  });
});

router.post("/login", (req, res) => {
  adminHelpers.doAdminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin;
      req.session.adminLoggedIn = true;
      res.redirect("/admin");
    } else {
      req.session.adminLoginErr = true;
      res.redirect("admin/login");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.admin=null
  res.redirect("/admin");
});

module.exports = router;
