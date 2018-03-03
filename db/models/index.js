var sequelize = require("../index");
const Sequelize = require("sequelize");

const Calls = sequelize.define("calls", {
	title: {
		type: Sequelize.STRING
	},
	audio: {
		type: Sequelize.STRING
	},
	on: {
		type: Sequelize.DATE
	}
});

const Contacts = sequelize.define("contacts", {
	name: {
		type: Sequelize.STRING
	},
	telephone: {
		type: Sequelize.STRING
	},
	call_id: {
		type: Sequelize.INTEGER,
		references: {
			model: Calls,
			key: "id"
		}
	}
});

module.exports = {
	Calls,
	Contacts
};

// Contacts.sync().then(() => {
// 	return Contacts.create({
// 		name: "Azhar",
// 		telephone: "9985635515",
// 		call_id: 1
// 	});
// });

// Calls.sync().then( () => {
//     return Calls.create({
//         title  : "Morning Reminder",
//         audio: "something.wbm",
//         on : Date.now()
//     })
// })
// Calls.sync({force : true}).then( () => {
//     // return Calls.create({
//     //     title  : "Morning Reminder",
//     //     audio: "something.wbm"
//     //     //on : Date.now()
//     // })
// }).then((result) => {
//     return Contacts.sync({force : true}).then(() => {
//         return Contacts.create({
//             name : "Azhar",
//             telephone : "9985635515",
//             call_id : "1"
//         })
//     });
// }).then(result => {
//     console.log(result);
// });
