const { Router } = require('express');
const commonUser = require('../controllers/commonUser')

const app = Router();
app.get('/api/commonUser', commonUser);

module.exports = app;