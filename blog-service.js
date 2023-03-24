const Sequelize = require('sequelize');
const { gte } = Sequelize.Op;

var sequelize = new Sequelize('ufegcxpn', 'ufegcxpn', 'gaudxzirOai0hg_I2FRVwogwFFwz_ft4', {
    host: 'raja.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Post.belongsTo(Category, { foreignKey: 'category' });

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve('database synced'))
            .catch(() => reject('unable to sync the database'));
    })
};

module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
        Post.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => reject("no results returned"));
    });
};

module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true
            }
        })
            .then((data) => { resolve(data) })
            .catch(() => reject('no results returned'));
    })
};

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => reject("no results returned"));
    });
};

module.exports.addPost = function (postData) {
    return new Promise((resolve, reject) => {
        postData.published = postData.published ? true : false;
        for (let post in postData) {
            if (postData[post] === "") {
                postData[post] = null;
            }
        }
        postData.postDate = new Date();
        Post.create(postData)
            .then(() => {
                resolve();
            })
            .catch(() => reject("unable to create post"));
    });
}

module.exports.getPostsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                category: category
            }
        })
            .then((data) => { resolve(data); })
            .catch(() => reject('no results returned'))
    })
}

module.exports.getPostsByMinDate = function (minDateStr) {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;

        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
            .then((data) => { resolve(data) })
            .catch(() => reject('no results returned'))
    })

}

module.exports.getPostById = function (id) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: id
            }
        })
            .then((data) => { resolve(data[0]); })
            .catch(() => reject('no results returned'))
    })
}

module.exports.getPublishedPostsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: category
            }
        })
            .then((data) => resolve(data))
            .catch(()=>reject('no results returned'));
    })
}

module.exports.addCategory = function (categoryData) {
    return new Promise((resolve, reject) => {
        for (var i in categoryData) {
            if (categoryData[i] == "") { categoryData[i] = null };
        }

        Category.create(categoryData)
            .then(()=>resolve())
            .catch(()=>reject('unable to create category'))
    })
}

module.exports.deleteCategoryById = function (id) {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                id: id
            }
        })
            .then(()=> resolve(console.log("category deleted  successfully")))
            .catch(()=>reject('unable to delete category'))
    })
}

module.exports.deletePostById = function (id) {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: {
                id: id
            }
        })
            .then(resolve(console.log("post deleted  successfully")))
            .catch(reject('unable to delete post'))
    })
}