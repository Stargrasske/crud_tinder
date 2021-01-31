/*
Import custom packages
*/
const dataService = require('../../services/dataService');
const { HTTPError, handleHTTPError } = require('../../utils');

/*
Get all messages
*/
const getMessages = (req, res, next) => {
  try {
    // Get messages from dataService
    const messages = dataService.getMessages();
    res.status(200).json(messages);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Get a specific message
*/
const getMessageById = (req, res, next) => {
  try {
    // Get id from url
    const { messageId } = req.params;
    // Get message with specific id
    const message = dataService.getMessageById(messageId);
    res.status(200).json(message);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Get messages from a specific user
*/
const getMessagesFromUserById = (req, res, next) => {
  try {
    // Get userId from url
    const { userId } = req.params;
    // Get type and friendId from params
    const { type, friendId } = req.query;
    let messages;
    // Decide which message method to run on data service and feed it the correct data
    if (type === 'conversation') {
      messages = dataService.getMessagesBetweenUsers(userId, friendId);
    } else if (type === 'sent') {
      messages = dataService.getSentMessagesFromUserById(userId);
    } else if (type === 'received') {
      messages = dataService.getReceivedMessagesFromUserById(userId);
    } else {
      messages = dataService.getMessagesFromUserById(userId);
    }
    res.status(200).json(messages);
  } catch (error) {
    handleHTTPError(error, next);
  }
};


/*
Create a new message
*/
const createMessage = (req, res, next) => {
  try {
    // Get the body from the response
    const message = req.body;
    const createdMessage = dataService.createMessage(message);
    // Send response
    res.status(201).json(createdMessage);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Update a specific message
*/
const updateMessage = (req, res, next) => {
  try {
    // Get the body from the response
    const message = req.body;
    // Get the message id from the parameters
    const { messageId } = req.params;
    const updatedMessage = dataService.updateMessage(messageId, message);
    res.status(200).json(updatedMessage);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Delete a specific message
*/
const deleteMessage = (req, res, next) => {
  try {
    // Get messageId parameter
    const { messageId } = req.params;
    // Delete a message
    const message = dataService.deleteMessage(messageId);
    res.status(200).json(message);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

// Export the action methods = callbacks
module.exports = {
  createMessage,
  deleteMessage,
  getMessages,
  getMessageById,
  getMessagesFromUserById,
  updateMessage,
};
