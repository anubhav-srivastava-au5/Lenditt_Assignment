const { Router } = require('express');
const getContacts = require('../controllers/getContacts')

const app = Router();
app.get('/api/getContacts', getContacts);

module.exports = app;