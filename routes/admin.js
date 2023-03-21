const { response } = require("express");
var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var adminHelpers = require("../helpers/admin-helpers");
const verifyLogin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET admin listing. */
router.get("/", function (req, res, next) {
  let admin = req.session.admin;
  console.log(req.session.admin, "==========/////////");
  if (req.session.admin) {
    productHelpers.getAllProducts().then(async (products) => {
      res.render("admin/view-products", { products, admin });
    });
  } else {
    res.redirect("/admin/login");
  }
});

router.get("/add-product", (req, res) => {
  res.render("admin/add-product");
});

router.post("/add-product", (req, res) => {
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.image;
    image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.render("admin/add-product");
      }
    });
  });
});

router.get("/delete-product/:id", (req, res) => {
  let proId = req.params.id;
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/admin/");
  });
});

router.get("/edit-product/:id", async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id);
  console.log(product);
  res.render("admin/edit-product", { product });
});

router.post("/edit-product/:id", (req, res) => {
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect("/admin");
    if (req.files.image) {
      let image = req.files.image;
      let id = req.params.id;
      image.mv("./public/product-images/" + id + ".jpg");
    }
  });
});

router.get("/login", (req, res) => {
  if (req.session.admin) {
    res.redirect("admin/view-products");
  } else {
    res.render("admin/login");
  }
});

router.get("/signup", (req, res) => {
  req.session.admin = response;
  req.session.admin.loggedIn;
  res.render("admin/signup");
});

router.post("/signup", (req, res) => {
  adminHelpers.adminSignup(req.body).then((response) => {
    res.redirect("/admin");
    console.log(response);
  });
});

router.post("/login", (req, res) => {
  adminHelpers.adminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin;
      res.redirect("/admin");
    } else {
      req.session.adminLoginErr = true;
      res.redirect("/admin");
      console.log("LoginFailed");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  console.log("LogoutSuccesful");
  res.redirect("/admin");
});

router.get("/all-users", (req, res) => {
  let admin = req.session.admin;
  adminHelpers.getAllUsers().then((users) => {
    res.render("admin/all-users", { users, admin });
  });
});

router.get("/orders", async (req, res) => {
  let admin = req.session.admin;
  adminHelpers.getOrders().then((orders) => {
    res.render("admin/orders", { orders, admin });
  });
});

router.get("/view-orders/:id", async (req, res) => {
  let admin=req.session.admin
  adminHelpers.getOrderProducts(req.params.id).then((orderItems) => {
    console.log(orderItems,"===order items in router==");
    res.render("admin/view-orders", { orderItems, admin });
  });
});

module.exports = router;
