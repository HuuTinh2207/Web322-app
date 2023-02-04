const fs = require("fs");
const { resolve } = require("path");
var posts = [];
var categories = [];

module.exports.initialize = function() {
    return new Promise ((resolve, reject) => {
        fs.readFile('./data/posts.json','utf8', (err, data) => {
            if (err) {
                reject ('unable to read file');
            } else {
                posts = JSON.parse(data);
            }
        })

        fs.readFile('./data/categories.json','utf8', (err, data) => {
            if (err) {
                reject ('unable to read file');
            } else {
                categories = JSON.parse(data);
            }
        })
        resolve();
    })
};

module.exports.getAllPosts = function() {
    return new Promise((resolve, reject) => {
        if (posts.length == 0) {
            reject ('no results returned');
        } else {
            resolve(posts);
        }
    })
};

module.exports.getPublishedPosts = function() {
    return new Promise((resolve, reject) => {
        var publishedPosts = posts.filter(post => post.published == true);
        if (publishedPosts.length == 0) {
            reject ('no results returned');
        } else {
            resolve(publishedPosts);
        }
    })
};

module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) {
            reject ('no results returned');
        } else {
            resolve(categories);
        }
    })
};