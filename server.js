const express = require("express");
const request = require("request");
const http = require("https");
const morgan = require("morgan");
const cors = require("cors");

const rest_level0 = require("./_routes/rest.level0");
const rest_level1 = require("./_routes/rest.level1");
const rest_level2 = require("./_routes/rest.level2");
const rest_level3 = require("./_routes/rest.level3");

const app = express();

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
	cors({
		origin: (origin, callback) => callback(null, true),
		credentials: true,
	})
);

const baseUrl = "/api_rest";

app.get(`${baseUrl}/`, function (req, res) {
	res.json("WORKS!");
});

app.use(`${baseUrl}/rest_level0`, rest_level0);

app.use(`${baseUrl}/rest_level1`, rest_level1);

app.use(`${baseUrl}/rest_level2`, rest_level2);

app.use(`${baseUrl}/rest_level3`, rest_level3);

// GESTIONE ERRORE
app.use((err, req, res, next) => {
	console.error("ERROR", err.stack);
	switch (true) {
		case typeof err === "string":
			// custom application error
			const is404 = err.toLowerCase().endsWith("not found");
			const statusCode = is404 ? 404 : 400;
			return res.status(statusCode).json({ message: err });
		default:
			return res.status(500).json({ message: err });
	}
});

const port = 8082;
app.listen(port, () => console.log("Server listening on port " + port));
