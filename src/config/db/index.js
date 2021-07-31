const mongoose = require('mongoose')
async function connect() {
    try {
        const uri = "mongodb+srv://nguyenthanhson162001:Son162001@cluster1.rjvkr.mongodb.net/secondhand_books_store?retryWrites=true&w=majority";
        // mongodb://cluster1-shard-00-01.rjvkr.mongodb.net:27017/secondhand_books_store
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        console.log("connect DB successfully")
    } catch (error) {
        console.log("connect DB failed" + error)
    }

}
module.exports = { connect }