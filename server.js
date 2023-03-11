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
const exphbs = require('express-handlebars')
const stripJs = require('strip-js')

//Template Engine
app.engine('.hbs', exphbs.engine({
  extname: ".hbs",
  defaultLayout: "main",
  helpers: {
    navLink: function (url, options) {
      return '<li' +
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    },
    safeHTML: function (context) {
      return stripJs(context);
    }
  }
}))

app.set('view engine', '.hbs');

//Cloudinary config
cloudinary.config({
  cloud_name: 'drsubzzcb',
  api_key: '678661945644676',
  api_secret: 'NPDfD2JOZMnzguOEO-quwS70_nc',
  secure: true
});

//Multer config without disk storage
const upload = multer()

var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});


// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function (req, res) {
  res.redirect('/blog');
});

// setup another route to listen on /about
app.get("/about", function (req, res) {
  res.render('about')
});

app.get("/blog", async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try {

    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogService.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogService.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = posts[0];

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
    viewData.post = post;

  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData })

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
    res.render("posts", { posts: data });
  }).catch((err) => {
    res.render("posts", { message: "no results" });
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
  res.render('addPost')
})

app.get("/posts/:id", (req, res) => {
  blogService.getPostById(req.params.id).then((data) => {
    res.json(data);
  }).catch(err => {
    res.json({ message: err });
  })
})

app.get("/blog/:id", async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try {

    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogService.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogService.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;

  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the post by "id"
    viewData.post = await blogService.getPostById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData })
});

app.get("/categories", function (req, res) {
  blogService.getCategories().then((data) => {
    res.render('categories', { categories: data });
  }).catch((err) => {
    res.render("categories", { message: "no results" });
  })
});

app.use((req, res) => {
  res.status(404).render('404');
});

// setup http server to listen on HTTP_PORT
blogService.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart());
}).catch(() => {
  console.log('Unsuccesfull')
})