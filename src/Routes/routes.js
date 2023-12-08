const express = require('express');
const router = express.Router();

const userContro = require("../Controller/userController")
  

  
router.post("/createUser", userContro.createUser)
router.post("/logIn", userContro.loginUser)
router.post("/forgetPass",userContro.forGetPassword)
router.post('/resetPassword/:id/:token',userContro.resetPassword)

module.exports = router;
