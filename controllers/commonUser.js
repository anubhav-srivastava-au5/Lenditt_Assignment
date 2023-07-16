const connection = require('../db');
const crypto = require('crypto');
const env = require('dotenv');
env.config();

function encryptPhoneNumber(phoneNumber) {
  const algorithm = 'aes-256-ctr';
  const encryptionKey = process.env.ENCRYPTION_KEY;
  const cipher = crypto.createCipher(algorithm, encryptionKey);
  let encrypted = cipher.update(phoneNumber, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}
module.exports =(req,res) =>{
    const { searchNumber } = req.query;
    // Checking if the search number is provided
    if (!searchNumber) {
      return res.status(400).json({ success: false, message: 'Missing search numbers.' });
    }
  console.log(searchNumber,"------searchNumber");
    // Decrypting the search number
    const decryptedNumber=encryptPhoneNumber(searchNumber)
    console.log("-------decryptedNumber--------",decryptedNumber);
    // Finding common users for the decrypted number
    const findCommonUsersQuery = `SELECT userId, name FROM contacts WHERE number = ?`;
    connection.query(findCommonUsersQuery, [decryptedNumber], (error, results) => {
      if (error) {
        console.error('Error querying MySQL:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while finding common users.' });
      }
      console.log(results);
      const commonUsers = results.map((user) => user.userId);
      const name = results.length > 0 ? results[0].name : null;
  
      return res.status(200).json({ success: true, name, commonUsers });
    });
}