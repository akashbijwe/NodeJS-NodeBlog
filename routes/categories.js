var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

/* GET categories. */
router.get('/add', function(req, res, next) {
  res.render('addCategory', {
    'title': "Add Category"
  });
});

router.post('/add', function(req, res, next) {
  var title = req.body.title;

  req.checkBody('title', 'Title field is required').notEmpty();
  var errors = req.validationErrors();

  if(errors){
    res.render('addCategory',{
      "errors": errors,
      "title": title  
    });
  }else{
    var categories = db.get('categories');
    categories.insert({
      "title": title
    }, function(err, category){
      if(err){
        res.send("Internal Server Error.");
      }else{
        req.flash('success', 'Category added!');
        res.location('/');
        res.redirect('/');
      }
    });
  }
});

router.get('/show/:category', function(req, res, next) {
  var db = req.db;
  var posts = db.get('posts');
  posts.find({category: req.params.category}, {}, function(err, posts){
    res.render('index', {
      'title': req.params.category,
      'posts': posts
    });
  });
});

module.exports = router;
 