
var express = require('express');
var router = express.Router();
var {Contacts, Calls} = require('../db/models/index');
/* GET home page. */
router.get('/', async function(req, res, next) {


  var callsList = await Calls.findAll();
  callsList = JSON.parse(JSON.stringify(callsList));
  var contactsList = await Contacts.findAll();
  contactsList = JSON.parse(JSON.stringify(contactsList));


  callsList.forEach(function(call){
    call.contacts = contactsList.filter(function(contact){
      return contact.call_id === call.id;
    });
    console.log(call);
  });
 
  res.render('index', { title: 'Express', callsList: JSON.parse(JSON.stringify(callsList)) });
});

module.exports = router;
