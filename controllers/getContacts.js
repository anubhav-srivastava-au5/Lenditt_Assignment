const connection = require('../db');
const crypto = require('crypto');
const env = require('dotenv');
env.config();

function decryptPhoneNumber(encryptedData) {
  console.log(encryptedData, "----------encryptedData");
  const algorithm = 'aes-256-ctr';
  const encryptionKey = process.env.ENCRYPTION_KEY;
  const decipher = crypto.createDecipher(algorithm, encryptionKey);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  console.log("decrypted---", decrypted);
  return decrypted;

}

module.exports = (req, res) => {
  const { userId, page, PageSize, searchText } = req.query;
  // Check if the required parameters are provided
  if (!userId || !page || !PageSize) {
    return res.status(400).json({ success: false, message: 'Missing required parameters.' });
  }
  const offset = (page - 1) * PageSize;

  //condition for name search
  const nameSearchCondition = searchText ? `AND name LIKE '%${searchText}%'` : '';

  // Get the total count of contacts for the user
  const totalCountQuery = `SELECT COUNT(*) AS totalCount FROM contacts WHERE userId = ? ${nameSearchCondition}`;
  connection.query(totalCountQuery, [userId], (error, results) => {
    if (error) {
      console.error('Error querying MySQL:', error);
      return res.status(500).json({ success: false, message: 'An error occurred while fetching contacts.' });
    }
    const totalCount = results[0].totalCount;
    // Fetch the contacts for the user with pagination and name search
    const getContactsQuery = `SELECT name, number FROM contacts WHERE userId = ? ${nameSearchCondition} LIMIT ? OFFSET ?`;
    connection.query(getContactsQuery, [userId, parseInt(PageSize), parseInt(offset)], (error, results) => {
      if (error) {
        console.error('Error querying MySQL:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while fetching contacts.' });
      }
      const contacts = results.map((contact) => ({ name: contact.name, number: decryptPhoneNumber(contact.number) }));
      return res.status(200).json({ success: true, totalCount, rows: contacts });
    });
  });
}