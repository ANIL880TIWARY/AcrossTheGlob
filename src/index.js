const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const route = require('./Routes/routes');
const mongoose = require('mongoose');


const port = 5000
const mongoString ="mongodb+srv://anil88:ghkHXqTEPEofBujh@cluster0.syc39.mongodb.net/AcrossTheGlob?retryWrites=true&w=majority"

app.use(bodyParser.json());

mongoose.connect(mongoString, {
   
})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use('/', route);


app.listen(port, function () {
    console.log('Express app running on port ' + port)
});
