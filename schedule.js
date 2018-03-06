var schedule = require("node-schedule");
var { Calls, Contacts } = require("./db/models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// schedule.scheduleJob("*/1 * * * *", function() {

// });

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
				[Op.gt]: d2,
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
}, 5000);

function executeCall(callId, contacts) {
	console.log(callId, contacts);
}
