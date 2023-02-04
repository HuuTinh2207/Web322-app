/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Huu Tinh Luu Student ID: 152712196 Date: 2/3/2023
*
*  Online (Cyclic) Link: https://brave-red-kangaroo.cyclic.app/
*
********************************************************************************/ 

var express = require("express");
var blogService = require(__dirname + "/blog-service.js");
var path = require("path");
var app = express();

var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
    res.redirect('/about');
});

// setup another route to listen on /about
app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"/views/about.html"));
});

app.get("/blog", function(req,res){
  blogService.getPublishedPosts().then((data) => {
    res.json({data});
  }).catch((err) => {
    res.json({message: err});
  })
});

app.get("/posts", function(req,res){
  blogService.getAllPosts().then((data) => {
    res.json({data});
  }).catch((err) => {
    res.json({message: err});
  })
});

app.get("/categories", function(req,res){
  blogService.getCategories().then((data) => {
    res.json({data});
  }).catch((err) => {
    res.json({message: err});
  })
});

app.use((req,res) => {
  res.status(404).sendFile(__dirname + "/views/404.html");
});

// setup http server to listen on HTTP_PORT
blogService.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart());
}).catch(() => {
  console.log('Unsuccesfull')
})