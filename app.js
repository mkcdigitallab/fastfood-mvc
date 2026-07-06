const express = require('express');
const path = require('path');
const routes = require('./routes/index');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Serveur MVC démarré sur http://localhost:${PORT}`);
});
