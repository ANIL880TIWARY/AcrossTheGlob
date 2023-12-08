const userModel = require("../Model/userModel")
const jwt = require("jsonwebtoken")
const secretKey = 'Anil@AcrossTheGlob'
const bcrypt = require("bcrypt")

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const createUser = async (req, res) => {
    try {
        const data = req.body;
        
        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, msg: "Bad request, No data provided." })
        };
        if (!isValid(data.userName)) {
            return res.status(400).send({ status: false, msg: "userName is required" })

        }
        if (!isValid(data.email)) { return res.status(400).send({ status: false, msg: "email is required" }) }
        if (!isValid(data.password)) { return res.status(400).send({ status: false, msg: "password is required" }) }

        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(data.email.trim()))) return res.status(400).send({ status: false, msg: "Please provide a valid email" });

        let duplicateUser = await userModel.findOne({ userName : data.userName })
        if (duplicateUser) return res.status(400).send({ status: false, msg: 'userName already exist' })

        const hashPass = await bcrypt.hash(data.password, 10)
        const doc = { userName:data.userName, email:data.email, password: hashPass }

        let userCreated = await userModel.create(doc);
        res.status(201).send({ status: true, message: "User created successfully", data: userCreated })
 
    }
    catch (error) {
       
        return res.status(500).send({data: error.message })
    }

}

const loginUser = async function (req, res) {
    try {
        const requestBody = req.body;

        if (Object.keys(requestBody).length == 0) {
            return res.status(400).send({ status: false, msg: "Bad request, No data provided." })
        };
        // EXTRACT PARAMS
        const userName = requestBody.userName
        const password = requestBody.password

        if (!isValid(userName)) {
            res.status(400).send({ status: false, message: `userName is required` })
            return
        }

        if (!isValid(password.trim())) {
            res.status(400).send({ status: false, message: `Password is required` })
            return
        }
        const isUser = await userModel.findOne({ userName: userName })
        if (!isUser) {
            res.status(401).send({ status: false, message: `Invalid userName` });
            return
        }

        const isMatch = await bcrypt.compare(password.trim() , isUser.password)

        if (!isMatch) {
            res.status(404).send({ status: false, message: "Invalid Password" })
            return
        }

        res.status(200).send({ status: true, message: "Login Success", data: isUser })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


const forGetPassword = async function (req, res) {
    try {
        const { userName } = req.body
        if (!isValid(userName)) {
            res.status(404).send('Fill Email & Password')
            return
        }
        const isUser = await userModel.findOne({ userName: userName })
        if (!isUser) {
            res.status(400).send({ status: false, message: "Invalid userName" })
            return
        }

        const secret = userName + secretKey

        const token = jwt.sign({ tokenId: isUser._id.toString() }, secret, { expiresIn: '15m' })
        const link = `localhost:5000/resetPassword/${isUser._id.toString()}/${token}`

        res.status(200).send({ status: true, data: `Change Password Link =>   ${link} ` })
    }
    catch (err) {

        res.status(500).send({ status: false, message: err.message })
    }

}

const resetPassword = async function (req, res) {

    const { id, token } = req.params
    const { password, Confirm_Password } = req.body
    const isUser = await userModel.findById(id)
    if (!isUser) {
        res.status(400).send({ status: false, message: "Link Not Valid" })
        return
    }
    try {
        const newSecret = isUser.userName + secretKey
        await jwt.verify(token, newSecret)
        if (!isValid(password || Confirm_Password)) {
            res.status(400).send({ status: false, message: "Fill Data" })
            return
        }
        if (password === Confirm_Password) {
            const hashPassword = await bcrypt.hash(password, 10)
            await userModel.findByIdAndUpdate(isUser._id.toString(), { $set: { password: hashPassword } })
            res.send(' Password Changed successfuly')
        } else {
            res.send('Password & Confirm_Password Not Match')
            return
        }
    }
    catch (err) {
        res.status(200).send(err.message)
    }
}








module.exports.createUser = createUser
module.exports.loginUser = loginUser
module.exports.forGetPassword = forGetPassword
module.exports.resetPassword = resetPassword