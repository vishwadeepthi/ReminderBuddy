var express = require("express");
var router = express.Router();
var { Calls, Contacts } = require("../db/models/index");
var fs = require("fs");
var path = require("path");

/* GET users listing. */
router.get("/", async function(req, res, next) {
	if (req.query.callid) {
		var contacts = await Contacts.findAll(
			{
				where: { call_id: req.query.callid }
			},
			{ raw: true }
		);

		var call = await Calls.findOne(
			{
				where: { id: req.query.callid }
			},
			{ raw: true }
		);

		//console.log(calls.length);
		console.log(contacts);
		res.render("setup", {
			call :  JSON.stringify(call),
			contacts : JSON.stringify(contacts)
		});
		//Query the DB with the ID;
	}
	res.render("setup", {
		call: {},
		contacts: []
	});
});

router.post("/configure", function(req, res, next) {

    var buf = new Buffer(req.body.blob, 'base64');
    fs.writeFileSync("public/recordings/some.webm", buf);
    res.json(req.body);
});



module.exports = router;
