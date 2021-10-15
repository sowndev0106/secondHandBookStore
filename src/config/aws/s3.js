var multer = require('multer')
var multerS3 = require('multer-s3')
var aws = require('aws-sdk')
require('dotenv').config()
// const S3 = require('aws-sdk/clients/s3')
const fs = require('fs')
const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

var s3 = new aws.S3({
    region,
    accessKeyId,
    secretAccessKey
})
var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: bucketName,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    })
})

function upload() {
    return upload
}
exports.upload = upload
// downloads a file from s3
function getFileStream(fileKey) {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName
    }
    var object = s3.getObject(downloadParams).createReadStream().on('error', (err) => console.log(err + 'ERROR GET FILE FROM 3S'))
    return object
}
exports.getFileStream = getFileStream
function deleteFile(keyfile) {
    if (keyfile) {
        console.log(keyfile)
        const deleteParams = {
            Key: keyfile,
            Bucket: bucketName
        }
        s3.deleteObject(deleteParams).createReadStream().on('error', (err) => console.log(err + 'ERROR DELETE FILE FROM 3S'))
    }
}
exports.deleteFile = deleteFile

function deleteFiles(keyfiles) {
    if (!keyfiles || keyfiles.length === 0)
        return

    for (const keyfile of keyfiles) {
        delete (deleteFile(keyfile))
    }
}
exports.deleteFiles = deleteFiles
