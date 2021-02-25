/* eslint-disable no-unused-vars */
require('dotenv').config();
const aws = require('aws-sdk');

const s3 = new aws.S3({
  region: 'us-east-1',
});

const S3_BUCKET = process.env.BUCKET_AWS_NAME;

async function uploadToS3(key, buffer, mimetype) {
  return new Promise((resolve, reject) => {
    s3.putObject(
      {
        Bucket: S3_BUCKET,
        ContentType: mimetype,
        Key: key,
        Body: buffer,
      },
      () => resolve(),
    );
  });
}

function getSignedUrl(key) {
  return new Promise((resolve, reject) => {
    s3.getSignedUrl(
      'getObject',
      {
        Bucket: S3_BUCKET,
        Key: key,
      },
      (err, url) => {
        if (err) throw new Error(err);

        resolve(url);
      },
    );
  });
}

module.exports = { uploadToS3, getSignedUrl };
