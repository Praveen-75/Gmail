var express = require('express');
const passport = require('passport');
var router = express.Router();
const userModel = require("./users")
const mailModel = require("./mail")
const localStrategy = require("passport-local")
const multer = require("multer");
const say = require("say");

passport.use(new localStrategy(userModel.authenticate()));

function fileFilter(req, file, cb) {
  if (file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true)
  } else {
    cb(new Error("Second Time Try Karna"))
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const fn = Date.now() + Math.floor(Math.random() * 10000000) + file.originalname;
    cb(null, fn)
  }
})
const upload = multer({ storage: storage, fileFilter })


router.post("/photo", isLoggedIn, upload.single("image"), async function (req, res) {
  const data = await userModel.findOne({ username: req.session.passport.user });
  data.profilePic = req.file.filename
  await data.save()
  res.redirect(req.headers.referer);
})



router.get('/', function (req, res, next) {
  res.render('index');
});

router.post("/register", function (req, res) {
  const userData = new userModel({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    mobile: req.body.mobile,
    gender: req.body.gender
  })
  userModel.register(userData, req.body.password)
    .then(function (registerUser) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile")
      })
    }).catch(function (e) {
      res.redirect("/")
    })
})


router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/"
}), function (req, res) { })

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) throw err;
    res.redirect("/")
  });
})


router.get('/register', function (req, res, next) {
  res.render('register');
});

router.get('/profile', isLoggedIn, function (req, res, next) {
  userModel.findOne({ username: req.session.passport.user })
    .populate({
      path: "receivedMails",
      populate: {
        path: "userid"
      }
    })
    .then(function (foundUser) {
      res.render("profile", { foundUser })
    })
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/")
}

router.get("/delete/:id", isLoggedIn, function (req, res) {
  userModel.findOne({ _id: req.params.id })
    .then(function (deleteUser) {
      if (deleteUser.username === req.session.passport.user) {
        userModel.findOneAndDelete({ _id: req.params.id })
          .then(function (delet) {
            res.redirect(req.headers.referer);
          })
      } else {
        res.send("Bhai Mt Presan Ho Kuch Hoga Nhi Tere se ?")
      }
    });
})

router.get("/delete/mail/:id", isLoggedIn, function (req, res) {
  mailModel.findOneAndDelete({ _id: req.params.id })
    .then(function (delet) {
      res.redirect(req.headers.referer)
    });
});

router.get("/check/:username", async function (req, res) {
  let user = await userModel.findOne({ username: req.params.username })
  res.json({ user })
})


// router.post("/compose",isLoggedIn,function(req,res){
//   userModel.findOne({username: req.session.passport.user})
//   .then(function(loggedinUser){
//     mailModel.create({
//       userid: loggedinUser._id,
//       receiver: req.body.receiveremail,
//       mailtext: req.body.mailtext
//     })
//     .then(function(createMail){
//       loggedinUser.sentMails.push(createMail._id)
//       loggedinUser.save()
//       .then(function(){
//         userModel.findOne({email: req.body.receiveremail})
//         .then(function(receiver){
//           receiver.receivedMails.push(createMail._id)
//           receiver.save()
//           .then(function(done){
//             res.send("Email AA Gai Hai Bhai");
//           })
//         })
//       })
//     });
//   });
// });

router.get("/sent", isLoggedIn, async function (req, res) {
  const loggedinUser = await userModel.findOne({ username: req.session.passport.user })
    .populate({
      path: "sentMails",
      populate: {
        path: "userid"
      }
    })
  res.render("sent", { user: loggedinUser })
})


router.get("/read/mail/:id", isLoggedIn, async function (req, res) {
  let mailMilGaya = await mailModel.findOne({ _id: req.params.id })
    .populate("userid")
  mailMilGaya.read = true;
  await mailMilGaya.save();
  res.render("read", { mail: mailMilGaya })
});


router.post("/compose", isLoggedIn, async function (req, res) {
  const loggedinUser = await userModel.findOne({ username: req.session.passport.user })
  const createdMail = await mailModel.create({
    userid: loggedinUser._id,
    receiver: req.body.receiveremail,
    mailtext: req.body.mailtext
  })
  if (loggedinUser.email !== req.body.receiveremail) {
    loggedinUser.sentMails.push(createdMail._id);
    const loggedinUserUpdate = await loggedinUser.save();

    const receiverUser = await userModel.findOne({ email: req.body.receiveremail });
    receiverUser.receivedMails.push(createdMail._id);
    const updateReceiverUser = await receiverUser.save();
    res.redirect("/sent")
  } else {
    res.redirect(req.headers.referer);
  }
})




module.exports = router;
