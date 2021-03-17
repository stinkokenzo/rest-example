function docReady(fn) {
	// see if DOM is already available
	if (
		document.readyState === "complete" ||
		document.readyState === "interactive"
	) {
		// call on next available tick
		setTimeout(fn, 1);
	} else {
		document.addEventListener("DOMContentLoaded", fn);
	}
}

function updateRequest(data, service) {
	const { body } = data;
	let request = `${data.method} ${service} HTTP/1.1\n${JSON.stringify(
		data,
		null,
		4
	)}\n\n`;
	if (data.method === "POST") {
		request += `BODY as Object:\n${JSON.stringify(
			JSON.parse(body),
			null,
			4
		)}`;
	}
	document.querySelector(
		"#rest_request .status-container"
	).textContent = request;
}
function updateResponse(data) {
	document.querySelector(
		"#rest_response .status-container"
	).textContent = JSON.stringify(data, null, 4);
}

async function callServer(method, restLevel, service, body) {
	const url = `http://localhost:8082/api_rest/${restLevel}${service}`;
	let args = {};
	if (method === "POST") {
		args = {
			method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		};
		updateRequest(args, service);
	} else if (method === "GET") {
		updateRequest({ method }, service);
	}
	const result = await fetch(url, args);

	if (result.status === 500 || result.status === 404) {
		return updateResponse({ message: { error: result.statusText } });
	}

	return responseHandler(result);
}

function responseHandler(response) {
	return response.text().then((text) => {
		var isValidJSON = true;
		try {
			JSON.parse(text);
		} catch {
			isValidJSON = false;
		}

		if (!isValidJSON) {
			updateResponse({ message: { error: response.statusText } });
			return Promise.reject(response.statusText);
		}

		const data = JSON.parse(text);

		if (!response.ok) {
			const error = (data && data.message) || response.statusText;
			updateResponse({ message: { error: error } });
			return Promise.reject(error);
		}

		return updateResponse(data);
	});
}

const requests_level0 = [
	{
		action: "openSlotRequest",
		date: "2021-05-31",
		doctor: "mjones",
	},
	{
		action: "appointmentRequest",
		date: "2021-05-31",
		doctor: "mjones",
		slot: {
			start: "1400",
			end: "1450",
		},
		patient: {
			id: "jsmith",
		},
	},
];

const requests_level1 = [
	{
		date: "2021-05-31",
	},
	{
		patient: {
			id: "jsmith",
		},
	},
];

const requests_level2 = [
	{},
	{
		patient: {
			id: "jsmith",
		},
	},
];

const requests_level3 = [
	{},
	{
		patient: {
			id: "jsmith",
		},
	},
];

docReady(function () {
	const rest_level0 = document.querySelector("#rest_level0");
	const rest_level1 = document.querySelector("#rest_level1");
	const rest_level2 = document.querySelector("#rest_level2");
	const rest_level3 = document.querySelector("#rest_level3");

	rest_level0.querySelector(".first button").addEventListener("click", () => {
		const service = rest_level0.querySelector(".first input").value;
		callServer("POST", "rest_level0", service, requests_level0[0]);
	});
	rest_level0
		.querySelector(".second button")
		.addEventListener("click", () => {
			const service = rest_level0.querySelector(".second input").value;
			callServer("POST", "rest_level0", service, requests_level0[1]);
		});

	rest_level1.querySelector(".first button").addEventListener("click", () => {
		const service = rest_level1.querySelector(".first input").value;
		callServer("POST", "rest_level1", service, requests_level1[0]);
	});
	rest_level1
		.querySelector(".second button")
		.addEventListener("click", () => {
			const service = rest_level1.querySelector(".second input").value;
			callServer("POST", "rest_level1", service, requests_level1[1]);
		});

	rest_level2.querySelector(".first button").addEventListener("click", () => {
		const service = rest_level2.querySelector(".first input").value;
		callServer("GET", "rest_level2", service, requests_level2[0]);
	});
	rest_level2
		.querySelector(".second button")
		.addEventListener("click", () => {
			const service = rest_level2.querySelector(".second input").value;
			callServer("POST", "rest_level2", service, requests_level2[1]);
		});

	rest_level3.querySelector(".first button").addEventListener("click", () => {
		const service = rest_level3.querySelector(".first input").value;
		callServer("GET", "rest_level3", service, requests_level3[0]);
	});
	rest_level3
		.querySelector(".second button")
		.addEventListener("click", () => {
			const service = rest_level3.querySelector(".second input").value;
			callServer("POST", "rest_level3", service, requests_level3[1]);
		});
});
