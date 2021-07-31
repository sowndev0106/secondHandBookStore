const mongoose = require('mongoose')
async function connect() {
    try {
        const uri = process.env.db || "mongodb+srv://nguyenthanhson162001:Son162001@cluster1.rjvkr.mongodb.net/secondhand_books_store?retryWrites=true&w=majority";
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        console.log("connect DB successfully")
    } catch (error) {
        console.log(uri)
        console.log("connect DB failed ne " + error)
    }

}
module.exports = { connect }