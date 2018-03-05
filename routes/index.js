
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
  });
 
  res.render('index', { title: 'Express', callsList: JSON.parse(JSON.stringify(callsList)) });
});

router.post('/delete_call', function(req, res){
  var id = req.body.id;
  Contacts.destroy({
    where: {
      "call_id": parseInt(id)
    }
  });
  Calls.destroy({
    where: {
      "id": parseInt(id)
    }
  });
  res.json("Deleted successfully");
});

module.exports = router;
