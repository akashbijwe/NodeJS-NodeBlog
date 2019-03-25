var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

/* GET users listing. */
router.get('/add', function(req, res, next) {
  var categories = db.get('categories');
  categories.find({}, {}, function(err, categories){
    res.render('addpost', {
      "title": "Add Post",
      "categories": categories
    });  
  });
});

router.post('/add', function(req, res, next) {
  //get form values
  var title    = req.body.title;
  var category = req.body.category;
  var body     = req.body.body;
  var author   = req.body.author;
  var date     = new Date();
  console.log("req.files", req.files);
  //check for image
  // if(req.files.mainImage){
  //   var mainImageOriginalName = req.files.mainImage.originalname;
  //   var mainImageName         = req.files.mainImage.name;
  //   var mainImageMime         = req.files.mainImage.mime;
  //   var mainImagePath         = req.files.mainImage.path;
  //   var mainImageExt          = req.files.mainImage.extension;
  //   var mainImageSize         = req.files.mainImage.size;
  // }else{
  //   var mainImageName = '/images/download.svg';
  // }
  
  //another solution for above commented code
  var mainImageName = '/images/download.svg';

  //form valiation
  req.checkBody('title', 'Title Field is required').notEmpty();
  req.checkBody('body', 'Body Field is required').notEmpty();
  
  var errors = req.validationErrors();
  if(errors){
    res.render('/addpost', {
      "error": errors,
      "title": title,
      "body": body
    })
  }else{
    var posts = db.get('posts');
    //submit to db
    posts.insert({
      "title": title,
      "body": body,
      "category": category,
      "date": date,
      "author": author,
      "mainImage": mainImageName
    }, function(err, posts){
      if(err){
        res.send("There was an issue submitting post");
      }else{
        req.flash('success', "Post Submitted");
        res.location('/');
        res.redirect('/');
      }
    });
  }
});

router.get('/show/:id', function(req, res, next) {
  var posts = db.get('posts');
  posts.findOne(req.params.id, function(err, post){
    console.log("post", post);
    res.render('post', {
      "post": post
    });  
  });
});


router.post('/addComment', function(req, res, next){
  var name= req.body.name;
  var email = req.body.email;
  var body= req.body.body;
  var postId= req.body.postId;
  var commentDate = new Date();
  console.log("name", req.body.name);
  req.checkBody('name', 'name field is required').notEmpty();
  req.checkBody('email', 'email field is required').notEmpty();
  req.checkBody('email', 'email id is invalid').isEmail();
  req.checkBody('body', 'body field is required').notEmpty();

  var errors = req.validationErrors();

  if(errors){
    console.log("error");
    var posts = db.get('posts');
    posts.findOne(req.body.postId, function(err, post){
      //res.render('/posts/show/'+req.body.postId,{
      res.render('post',{
        "errors": errors,
        "post": post
      });
    });
  }else{
    console.log("else", req.body.postId);
    var comment = {"name": name, "email": email, "body": body, "commentDate": commentDate};
    var posts = db.get('posts');
    
    //update post
    posts.update({
      '_id': req.body.postId
    },
    {
      $push: {
        'comments': comment
      }
    }, function(err, doc){
      if(err){
        throw err;
      }else{
        req.flash('success', 'Comment added');
        res.location('/posts/show/'+req.body.postId);
        res.redirect('/posts/show/'+req.body.postId);
      }
    });
  }

});
module.exports = router;
