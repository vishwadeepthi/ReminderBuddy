var schedule = require("node-schedule");
var { Calls, Contacts } = require("./db/models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const aS = "";
const aT = "";
const client = require("twilio")(aS || process.env.aS, aT || process.env.aT);

// schedule.scheduleJob("*/1 * * * *", function() {

// });

console.log("********* SCHEUDLER STARTED ************");

setInterval(() => {
	var d1 = new Date(),
		d2 = new Date();

	d2.setMinutes(d1.getMinutes() - 10);
	console.log(d1, d2);
	Calls.findAll({
		where: {
			completed: {
				[Op.or]: [false, null]
			},
			on: {
				[Op.lt]: d1
			}
		}
	}).then(function(result) {
		result.map(function(item) {
			let callId = item.get("id");

			Calls.update(
				{
					completed: true
				},{
					where: {
						id: callId
					}
				}
			).then(function() {
				return Contacts.findAll({
					where: {
						call_id: callId
					}
				}).then(function(contacts) {
					var telephones = contacts.map(c => c.get("telephone"));
					executeCall(callId, telephones);
				});
			});
		});
	});
}, 120000);
//Runs every two mins

function executeCall(callId, contacts) {
	console.log(callId, contacts);
	contacts.forEach(item => {
		console.log("********* CALL MADE TO ************", callId, item, new Date());
		makeCall(callId, item);
	});
}


function makeCall(callid,tNumber) {
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
}