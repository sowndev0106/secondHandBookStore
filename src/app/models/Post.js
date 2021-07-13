const mongoose = require('mongoose')
var mongoose_delete = require('mongoose-delete')
const slug = require('mongoose-slug-generator')
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema

const Post = new Schema({
  name: String,
  price: { type: Number, default: 0 },
  condition: { type: Number, default: 50 },
  quantity: { type: Number, default: 1 },
  description: String,
  englishAlphabetLowercased: String,
  images: [{ type: String }],
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true, default: '60e3de26c94479104e56e475' },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timeAgo: String
}, { timestamps: true })

Post.plugin(mongoose_delete, {
  overrideMethods: ['count', 'findOneAndUpdate', 'update'],
  deletedAt: true
});

Post.plugin(mongoosePaginate);

module.exports = mongoose.model('Post', Post)
