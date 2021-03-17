const express = require("express");
const router = express.Router();
const fs = require("fs");

const agenda = JSON.parse(fs.readFileSync("./agenda.json"));

// routes
router.post("/doctors/:doctor", doctorHandler);
router.post("/slots/:slotId", slotHandler);

module.exports = router;

function doctorHandler(req, res, next) {
	console.log("doctorHandler", req.body);

	if (!req.params.doctor) {
		throw "No Doctor provided";
	}

	try {
		const { date } = req.body;
		const doctor = req.params.doctor;
		const response = searchInAgenda({ doctor, date });
		const slots = response.dates[0].slots.map((slot) => ({
			slot: {
				id: slot.id,
				start: slot.start,
				end: slot.end,
			},
		}));
		res.json({
			response: "openSlotList",
			doctor,
			slots,
		});
	} catch (error) {
		throw error.message;
	}
}

function slotHandler(req, res, next) {
	console.log("slotHandler", req.body);

	if (!req.params.slotId) {
		throw "No Slot provided";
	}

	try {
		const { patient } = req.body;
		const slotId = req.params.slotId;
		const slot = { id: slotId };
		const response = searchInAgenda({ slot });
		res.json({
			response: "appointment",
			slot: response.dates[0].slots[0],
			doctor: response.doctor,
			patient,
		});
	} catch (error) {
		throw error.message;
	}
}

function searchInAgenda(args) {
	const { doctor, date, slot } = args;
	return agenda.filter((item) => {
		if (item.doctor === doctor || !doctor) {
			item.dates.filter((item) => {
				if (item.date === date || !date) {
					if (slot) {
						item.slots.filter((item) => item.id === slot.id);
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
