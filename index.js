const express = require('express');
const env = require('dotenv');
const app = express();
env.config();
app.use(express.json());
const sync_contacts = require('./routers/sync_contacts_router');
const get_contacts = require('./routers/get_contacts_router');
const common_user = require('./routers/common_user_router');

app.use(sync_contacts);
app.use(get_contacts);
app.use(common_user);


app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT} Successfully..!!`);
});
