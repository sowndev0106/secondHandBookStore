
    function mmo(mongooses){
        return  mongooses.map(mongoose => mongoose.toObject())
    }

module.exports = {
    mutipleMongooseToObject:mmo,
    mongooseToObject: function (mongoose){
        return  mongoose ? mmo(mongoose)[0]: mongoose
    }
}