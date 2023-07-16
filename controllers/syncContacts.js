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
module.exports = (req, res) => {

  const { userId, Contacts } = req.body;

  // Check if the request body contains the required fields
  if (!userId || !Contacts) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  // Preparing a list of encrypted phone numbers from the Contacts
  const encryptedPhoneNumbers = Contacts.map((contact) => {
    const encryptedNumber =encryptPhoneNumber(contact.number)
    return { name:contact.name, number: encryptedNumber };
  });

  // Checking if the Contacts already exist in the database
  const existingContactsQuery = `SELECT COUNT(*) AS count FROM contacts WHERE userId = ? AND number IN (?)`;
  connection.query(existingContactsQuery, [userId, encryptedPhoneNumbers.map((contact) => contact.number)], (error, results) => {
    if (error) {
      console.error('Error querying MySQL:', error);
      return res.status(500).json({ success: false, message: 'An error occurred while saving the Contacts.' });
    }

    const duplicateCount = results[0].count;

    // If there are duplicates, send an error response
    if (duplicateCount > 0) {
      return res.status(400).json({ success: false, message: 'Duplicate Contacts found.' });
    }

    // Insert the Contacts into the database
    const insertQuery = 'INSERT INTO contacts (userId, name, number) VALUES ?';
    connection.query(insertQuery, [encryptedPhoneNumbers.map((contact) => [userId, contact.name, contact.number])], (error) => {
      if (error) {
        console.error('Error inserting Contacts to MySQL:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while saving the Contacts.' });
      }
      console.log("here0---------");
      return res.status(200).json({ success: true, message: 'Data saved successfully.' });
    });
  });
}