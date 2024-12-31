const express = require("express");
const app = express();
const PORT = /*process.env.PORT ||*/ 3003;

app.get('/', (req, res) => {
	res.send("Hello there, this is Coupon System.");
});

app.listen(PORT, () => {
	console.log(`Coupon Server up and runnin' on port ${PORT}.`);
});

