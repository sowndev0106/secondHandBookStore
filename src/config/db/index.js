const mongoose = require('mongoose')
async function connect() {

    const uri = "mongodb+srv://son:162001@cluster0.vch9y.mongodb.net/secondhandbooks?retryWrites=true&w=majority";
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        console.log("connect DB successfully")
    } catch (error) {
        console.log(uri)
        console.log("connect DB failed  " + error)
    }
}
module.exports = { connect }