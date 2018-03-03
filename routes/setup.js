var express = require("express");
var router = express.Router();
var { Calls, Contacts } = require("../db/models/index");
var fs = require("fs");
var path = require("path");
let multer = require("multer");

const client = require("twilio")(process.env.aS, process.env.aT);
const deep = "+919912625029";
const azhar = "+919985635515";

var storage = multer.diskStorage({
	filename: function(req, file, callback) {
		callback(
			null,
			file.fieldname + "_" + Math.floor(Math.random() * 100000) + ".webm"
		);
	},
	destination: function(req, file, cb) {
		cb(null, path.join(__dirname + "../../pubic/recordings/"));
	}
});

var upload = multer({
	storage: storage
});
//var type = upload.single('audiofile');

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
		return res.render("setup", {
			call: JSON.stringify(call),
			contacts: JSON.stringify(contacts)
		});
		//Query the DB with the ID;
	}
	res.render("setup", {
		call: {},
		contacts: []
	});
});

router.post("/configure", upload.single("audiofile"), function(req, res, next) {
	if (req.body.callid) {
		//This means we are updating audio clip for a given call id;
		return Calls.update(
			{
				audio: req.file.filename
			},
			{
				where: {
					id: req.body.callid
				}
			}
		).then(result => {
			res.json({ success: true, file: req.file, result });
		});
	} else {
		Calls.create({
			title: "Morning Reminder #1",
			audio: req.file.filename
		}).then(result => {
			res.json({ success: true, file: req.file, result });
		});
	}
});

router.post("/testcall", function(req, res) {
	client.calls.create(
		{
			url: "http://blooming-scrubland-22902.herokuapp.com/say.xml",
			to: azhar,
			from: "+15153053983"
		},
		(err, call) => {
			if (err) {
				return console.log(err);
			}

			console.log(call.sid);
		}
	);

	res.json({ success: true });
});

module.exports = router;
