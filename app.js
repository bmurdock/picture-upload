// Import express and other required external files
const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Define global constants for my app, such as port
// check to see if there is an environment variable defined for these
// environment variables are in process.env
const port = 8832;
const appName = 'Test Application';
const bucketName = 'bjm-class2';
const bucketRegion = 'us-west-1';


// Define my app
const app = express();

// Define any middleware to use, if necessary
app.use(express.static('public'));

// If you are going to define routes in THIS file, do it here
app.post('/image-upload', upload.single('image'), function (req, res, next) {

    createBucket(bucketName)
        .then((result) => {
            uploadImage(req.file);
            res.send('Uploaded');
        })
        .catch((err) => {
            console.error(err);
            res.send('Error uploading file');
        });

});

// Tell the app to listen on the specified port and handle any errors
app.listen(port, (err) => {
    if (err) {
        console.error('Error starting app: ', err);
    }
    console.log(`${appName} listening on port ${port}...`);
});


// AWS Stuff
// YOU NEED YOUR OWN AWS ACCESS INFO STUFF
const creds = new AWS.Credentials({
    accessKeyId: '',
    secretAccessKey: '',
});
AWS.config.credentials = creds;

const s3 = new AWS.S3();


function uploadImage(image) {
    // This is very likely to be unique for our purposes
    const key = `pic-${Date.now()}`;
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: image.buffer,
        ContentType: image.mimetype,
        ACL: "public-read"
    };
    s3.upload(params, (err, data) => {
        console.log(err, data);
    });
}

function createBucket(bucketName) {
    return new Promise(((resolve, reject) => {
        const params = {
            Bucket: bucketName,
        };
        s3.headBucket(params, (err, _data) => {
            if (err) {
                if (err.code === 'NotFound') {
                    params.CreateBucketConfiguration = {
                        LocationConstraint: bucketRegion,
                    };
                    s3.createBucket(params, (err, _data) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(true);
                        }
                    });
                }
                else {
                    reject(err);
                }
            }
            else {
                resolve(true);
            }
        });
    }));
}

// Exact same function with regular functions instead of => functions
function createBucketES5(bucketName) {
    return new Promise(function (resolve, reject) {
        const params = {
            Bucket: bucketName
        };
        s3.headBucket(params, function (err, data) {
            if (err) {
                if (err.code === 'NotFound') {
                    params.CreateBucketConfiguration = {
                        LocationConstraint: bucketRegion
                    };
                    s3.createBucket(params, function (err, data) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(true);
                        }
                    })
                } else {
                    reject(err)
                }
            } else {
                resolve(true);
            }
        });
    });
}