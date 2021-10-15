const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRECT
})

async function addFile(path) {
    return await cloudinary.uploader.upload(path);
}

function removeFile(file) {

}
module.exports = { addFile, removeFile }