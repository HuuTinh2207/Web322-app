const fs = require("fs");
const { resolve } = require("path");
var posts = [];
var categories = [];

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/posts.json', 'utf8', (err, data) => {
            if (err) {
                reject('unable to read file');
            } else {
                posts = JSON.parse(data);
            }
        })

        fs.readFile('./data/categories.json', 'utf8', (err, data) => {
            if (err) {
                reject('unable to read file');
            } else {
                categories = JSON.parse(data);
            }
        })
        resolve();
    })
};

module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
        if (posts.length == 0) {
            reject('no results returned');
        } else {
            resolve(posts);
        }
    })
};

module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
        var publishedPosts = posts.filter(post => post.published == true);
        if (publishedPosts.length == 0) {
            reject('no results returned');
        } else {
            resolve(publishedPosts);
        }
    })
};

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) {
            reject('no results returned');
        } else {
            resolve(categories);
        }
    })
};

module.exports.addPost = function (postData) {
    return new Promise((resolve, reject) => {
        if (postData.published == undefined) {
            postData.published = false;
        } else {
            postData.published = true;
        }

        postData.id = posts.length + 1;
        let today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth() + 1;
        let day = today.getDate();
        postData.postDate = year + "-" + month + "-" + day;
        posts.push(postData);
        resolve(postData);
    })
}

module.exports.getPostsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        let categoriedPost = posts.filter(post => post.category == category);

        if (categoriedPost.length == 0) {
            reject('no result returned');
        } else {
            resolve(categoriedPost);
        }
    })
}

module.exports.getPostsByMinDate = function (minDateStr) {
    return new Promise((resolve, reject) => {
        let filteredPost = posts.filter(post => (new Date(post.postDate)) >= (new Date(minDateStr)));

        if (filteredPost.length == 0) {
            reject('no result returned');
        } else {
            resolve(filteredPost);
        }
    })
}

module.exports.getPostById = function (id) {
    return new Promise((resolve, reject) => {
        let postById = posts.find(post => post.id == id);

        if (postById) {
            resolve(postById);
        } else {
            reject('no result returned');
        }
    })
}

module.exports.getPublishedPostsByCategory = function (category) {
    return new Promise((resolve, resject) => {
        var publishedPosts = posts.filter(post => post.published == true && post.category == category);
        if (publishedPosts.length == 0) {
            reject('no results returned');
        } else {
            resolve(publishedPosts);
        }
    })
}