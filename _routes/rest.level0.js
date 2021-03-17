const express = require("express");
const router = express.Router();
const fs = require("fs");

const agenda = JSON.parse(fs.readFileSync("./agenda.json"));

// routes
router.post("/appointmentService", requestHandler);

module.exports = router;

function requestHandler(req, res, next) {
	console.log("requestHandler", req.body);

	if (!req.body || !req.body.action) {
		throw "No Action in JSON";
	}

	try {
		const { action, date, doctor, slot, patient } = req.body;

		if (action) {
			if (action === "openSlotRequest") {
				const response = searchInAgenda({ doctor, date });
				if (!response) {
					throw "Not found";
				}
				res.json(responseHandler(action, response));
			} else if (action === "appointmentRequest") {
				const response = searchInAgenda({ doctor, date, slot });
				if (!response) {
					throw "Not found";
				}
				res.json(responseHandler(action, { ...response, patient }));
			} else {
				throw "Action not found";
			}
		}
	} catch (error) {
		throw error.message;
	}
}

function responseHandler(action, data) {
	console.log("responseHandler", data);
	if (action === "openSlotRequest") {
		const slots = data.dates[0].slots.map((slot) => ({
			slot: {
				start: slot.start,
				end: slot.end,
			},
		}));
		return {
			response: "openSlotList",
			doctor: data.doctor,
			slots,
		};
	} else if (action === "appointmentRequest") {
		return {
			response: "appointment",
			slot: {
				start: data.dates[0].slots[0].start,
				end: data.dates[0].slots[0].end,
			},
			doctor: data.doctor,
			patient: data.patient,
		};
	}
}

function searchInAgenda(args) {
	const { doctor, date, slot } = args;
	return agenda.filter((item) => {
		if (item.doctor === doctor) {
			item.dates.filter((item) => {
				if (item.date === date) {
					if (slot) {
						item.slots.filter(
							(item) =>
								item.start === slot.start &&
								item.end === slot.end
						);
					}
					return true;
				}
				return false;
			});
			return true;
		}
		return false;
	})[0];
}
