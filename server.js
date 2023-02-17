/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Huu Tinh Luu Student ID: 152712196 Date: 2/17/2023
*
*  Online (Cyclic) Link: https://brave-red-kangaroo.cyclic.app/
*
********************************************************************************/

var express = require("express");
var blogService = require(__dirname + "/blog-service.js");
var path = require("path");
var app = express();
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

//Cloudinary config
cloudinary.config({
  cloud_name: 'drsubzzcb',
  api_key: '678661945644676',
  api_secret: 'NPDfD2JOZMnzguOEO - quwS70_nc',
  secure: true
});

//Multer config without disk storage
const upload = multer()

var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function (req, res) {
  res.redirect('/about');
});

// setup another route to listen on /about
app.get("/about", function (req, res) {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/blog", function (req, res) {
  blogService.getPublishedPosts().then((data) => {
    res.json({ data });
  }).catch((err) => {
    res.json({ message: err });
  })
});

app.get("/posts", function (req, res) {
  let query = null;
  if (req.query.category) {
    query = blogService.getPostsByCategory(req.query.category);
  } else if (req.query.minDate) {
    query = blogService.getPostsByMinDate(req.query.minDate);
  } else {
    query = blogService.getAllPosts();
  }

  query.then((data) => {
    res.json({ data });
  }).catch((err) => {
    res.json({ message: err });
  })
});


app.post("/posts/add", upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req).then((uploaded) => {
      req.body.featureImage = uploaded.url;
    // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
      blogService.addPost(req.body).then(post => {
        res.redirect("/posts");
      }).catch(err => {
        res.status(500).send(err);
      })
    });
  } else {
    req.body.featureImage = "";
    // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
    blogService.addPost(req.body).then(post => {
      res.redirect("/posts");
    }).catch(err => {
      res.status(500).send(err);
    })
  }
})

app.get("/posts/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addPost.html"));
})

app.get("/posts/:id", (req, res) => {
  blogService.getPostById(req.params.id).then((data) => {
    res.json(data);
  }).catch(err => {
    res.json({ message: err });
  })
})

app.get("/categories", function (req, res) {
  blogService.getCategories().then((data) => {
    res.json({ data });
  }).catch((err) => {
    res.json({ message: err });
  })
});

app.use((req, res) => {
  res.status(404).sendFile(__dirname + "/views/404.html");
});

// setup http server to listen on HTTP_PORT
blogService.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart());
}).catch(() => {
  console.log('Unsuccesfull')
})