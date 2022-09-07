const express = require("express");
const router = require("./routers");
const port = 8080;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

app.get("/", (request, response) => {
	response.send(`Servidor rodando...`);
});

app.listen(port, () => {
	console.log(`Servidor rodando na porta ${port}`);
});
