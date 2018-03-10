var express = require("express");
var router = express.Router();
var { Calls, Contacts } = require("../db/models/index");
var fs = require("fs");
var path = require("path");
let multer = require("multer");
const aS = "";
const aT = "";
const client = require("twilio")(aS || process.env.aS, aT || process.env.aT);


var storage = multer.diskStorage({
	filename: function(req, file, callback) {
		callback(
			null,
			file.fieldname + "_" + Math.floor(Math.random() * 100000) + ".wav"
		);
	},
	destination: function(req, file, cb) {
		cb(null, path.join(__dirname + "../../public/recordings/"));
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
        console.log("Deepthi here")
	
        return res.render("setup", {
			call: JSON.stringify(call),
			contacts: JSON.stringify(contacts)
		});
		//Query the DB with the ID;
	}
	res.render("setup", {
		call: JSON.stringify({}),
		contacts: JSON.stringify([])
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
	var { cName, tNumber, callid } = req.body;
	console.log(cName, tNumber, callid);
	client.calls.create(
		{
			url: "https://reminderbuddy.herokuapp.com/say.xml?callid=" + callid,
			to: "+91" + tNumber,
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

router.post("/scheduleon", function(req, res) {
    
    var { on, id } = req.body;
	Calls.update(
		{
			on: on
		},
		{
			where: {
				id: id
			}
		}
	).then(result => {
        res.json({
            success: true
        });
    })
    .catch(err => {
        res.json({ success: false, err: err });
    });

});

router.post("/addcontacts", function(req, res) {
	console.log(req.body);
	console.log(req.params);

	var { callid, contacts } = req.body;

	contacts = contacts || [];

	Contacts.destroy({
		where: {
			call_id: parseInt(callid)
		}
	})
		.then(result => {
			return Contacts.bulkCreate(contacts);
		})
		.then(result => {
			res.json({ success: true });
		})
		.catch(err => {
			res.json({ success: false, message: err });
		});
});
module.exports = router;
