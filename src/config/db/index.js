const mongoose = require('mongoose')
async function connect(){
    try{
        await mongoose.connect('mongodb://localhost:27017/secondhand_books_store', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
          });
        console.log("connect DB successfully")
    }catch(error){
        console.log("connect DB failed")
    }

}
module.exports = {connect}