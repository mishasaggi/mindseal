var db = require('../models/userData.js');
// var Auth  = require ('./auth.js');
var bcrypt = require('bcrypt-nodejs');

module.exports = {
  userExists: function(username){
    console.log("checking to see if: " + username + " exists");
    var y = db.userFind(username)
    console.log("this was returned from model db.userFind call: ", y);
    return y;
  },

  makeUser: function(req, res){
    var username = req.body.username;
    var password = req.body.password;

    console.log("attempting to make user: " + username + " " + password);
    
    return new Promise(function(resolve, reject) {
      bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(password, salt, null, function(err, hash) {
          if (err) {
            console.log("hashing the password failed, see user.js " + err);
            reject(err);
          }
          else {
            console.log("hash was successful.");
            resolve(hash);
          }
        })
      })
    })
    .then(function(hash){
      console.log("hash to model: " + hash)
      return db.createUser(username, hash)
    })
  },

  login: function(req, res){
    console.log("attempt login with: " + req.body.username + req.body.password);

    var username = req.body.username;
    var password = req.body.password;

    return db.userFind(username)
    .then(function(userObj){
      if(!userObj){
        console.log("did not find " + username + " in database.");
        res.send({message:"failed: no such username"});
      }
      else {
        console.log("found user: " + userObj._id, userObj);
        return new Promise(function(resolve, reject){
          bcrypt.compare(password, userObj.hashword, function(err, bool) {
            resolve({bool:bool, 
              user:userObj._id,
              mindSeal: userObj
            })
          })
          // .catch(function(err){
          //   console.log("error: ", err);
          // })
        })
      } 
    })
  },

  getShared: function(){

  return db.userFind("shared")
    .then(function(userObj){
      if(!userObj){
        console.log("did not find " + username + " in database.");
        res.send({message:"failed: no shared user"});
      }
      else {
        console.log("found user: " + userObj._id);
        return userObj.decks
      } 
    })
  },

  shareDeck: function(deck, deckName){    
    return db.createDeck("shared", deckName, deck)
  },

  // OLD STUFF -- REWRITE

  getDecks: function(req, res) {
    // var googleId = "mvp_test";
    // var googleId = req.headers.userid;
    db.getDecks(/*googleId*/)
      .then(function(decks) {
        res.send(decks);
      })
      .catch(function(err) {
        console.log(err, "handler");
        res.send(500, err);
      });
  },

  // getDecks: function(req, res) {
  //   // With Auth:
  //   Auth.getId(req)
  //     .catch(function(err) {
  //       // Handler for unsuccessful auth with Google
  //       res.send(401, err);
  //     })
  //     .then(function(googleId) {
  //       console.log(googleId, " :id in reqh auth")
  //       return db.getDecks(googleId)
  //     })
  //     .then(function(decks) {
  //       console.log(decks, " : decks passed to reqH")
  //       res.send(decks);
  //     })
  //     .catch(function(err) {
  //       console.log(err);
  //       res.send(500, err);
  //     });
  // },

  refreshDecks: function(req, res) {
    var decks = req.body.decks; //use just body when Auth integrated/tested
    Auth.getId(req)
      .catch(function(err) {
      // Handler for unsuccessful auth with Google
      res.send(401, err);
      })
      .then(function(googleId) {
        return db.refreshDecks(googleId, decks)
      })
      .then(function() {
          res.send(201)
      })
      .catch(function(err) {
        console.log(err);
        res.send(500, err);
      });
  },

  createDecks: function(req, res) {
    var googleId = req.body.googleId;
    var deckName = req.body.deckName;
    // var googleId = req.get('googleId');
    // var googleId = 'mvp_test';
    db.createDecks(googleId, deckName, req.body.deck)
      .then(function(deck_id) {
        res.send(201, deck_id)
      })
      .catch(function(err) {
        console.log(err);
        res.send(500, err);
      });
  },

  createUser: function(req,res) {
    console.log(req.headers, ": check for chrome token")
    Auth.getId(req)
      .catch(function(err) {
        res.send(401,err);
      })
      .then(function(googleId) {
        return db.createUser(googleId);
      })
      .then(function() {
        res.send(201);
      })
      .catch(function(err) {
        console.log(err);
        res.send(501, err);
      });
  },

  setMindSeal: function(username, mindSeal, time){
    mindSeal.userSettings.lastEdit = time;
    console.log("mindseal is:",mindSeal);
    console.log("time is:",mindSeal.userSettings.lastEdit);
    return db.refreshDecks(username, mindSeal.decks)
    .then(function(success){
      console.log("refreshed decks of " + username + " with ", mindSeal.decks);
      return db.setSettings(username, mindSeal.userSettings)
    })
    .catch(function(err){
      console.log("err @ setMindSeal reqHan", err)
    })
  }

  // createDeck: function(req, res) {
  //   // With Auth:
  //   var deckName = req.body.deckName;

  //   Auth.getId(req)
  //     .catch(function(err) {
  //       // Handler for unsuccessful auth with Google
  //       res.send(401, err);
  //     })
  //     .then(function(googleId) {
  //       return db.createDeck(googleId, deckName, req.body);
  //     })
  //     .then(function(deckId) {
  //       res.send(201, deckId)
  //     })
  //     .catch(function(err) {
  //       console.log(err);
  //       res.send(500, err);
  //     });
  // }
};


  //old, pre-refactor:

  // makeUser: function(req, res){
  //   bcrypt.genSalt(10, function(err, salt){
  //     bcrypt.hash(password, salt, null, function(err, hash) {
  //       if (err) {
  //         console.log("hashing the password failed, see user.js " + err);
  //       }
  //       else {
  //         console.log("hash was successful.");
  //         // console.log("promise object? : ")
  //         // console.log(db.createUser(username, hash))
  //         // return db.createUser(username, hash)
  //         db.createUser(username, hash)
  //         .then(function(x){

          
  //           res.send({data:"make a session"});
          

  //         })
  //         .catch(function(error){
  //           console.log("encryption error: " + error);
  //           res.send({message:"failed.",error:error});
  //         })
  //       }
  //     })
  //   })
  // },