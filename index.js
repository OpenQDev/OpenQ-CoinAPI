const express = require('express');

const PORT = 8081;
const app = express();

app.get('/', (req, res) => {
    res.send(`OpenQ-CoinAPI!`);
});

app.listen(PORT);

console.log(`Listening on ${PORT}`);