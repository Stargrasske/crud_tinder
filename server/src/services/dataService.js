/*
Import packages
*/
const fs = require('fs');
const path = require('path');
const {
  v4: uuidv4,
} = require('uuid');

/*
Import custom packages
*/
const {
  HTTPError,
  // convertArrayToPagedObject
} = require('../utils');

/*
File paths
*/
const filePathMessages = path.join(__dirname, '..', 'data', 'messages.json');
const filePathMatches = path.join(__dirname, '..', 'data', 'matches.json');
const filePathUsers = path.join(__dirname, '..', 'data', 'users.json');

/*
Read users.json file
*/
const readDataFromUsersFile = () => {
  const data = fs.readFileSync(filePathUsers, {
    encoding: 'utf-8',
    flag: 'r',
  });
  const users = JSON.parse(data);
  return users;
};

/*
Get all users
*/
const getUsers = () => {
  try {
    const users = readDataFromUsersFile();
    users.sort((a, b) => {
      if (a.firstName > b.firstName) {
        return 1;
      }
      if (a.firstName < b.firstName) {
        return -1;
      }
      return 0;
    });
    return users;
  } catch (error) {
    throw new HTTPError('Can\'t get users! ', 500);
  }
};

/*
Get a specific user
*/
const getUserById = (userId) => {
  try {
    const users = readDataFromUsersFile();
    const selectedUser = users.find(u => u.id === userId);
    return selectedUser;
  } catch (error) {
    throw new HTTPError(`Can't get user with id ${userId}!`, 404);
  }
};

/*
Read messages.json file
*/
const readDataFromMessagesFile = () => {
  const data = fs.readFileSync(filePathMessages, {
    encoding: 'utf-8',
    flag: 'r',
  });
  const messages = JSON.parse(data);
  return messages;
};

/*
Get all messages
*/
const getMessages = () => {
  try {
    const messages = readDataFromMessagesFile();
    return messages;
  } catch (error) {
    throw new HTTPError('Can\'t get messages! ', 500);
  }
};

/*
Get all messages from a specific user
*/
const getMessagesFromUserById = (userId) => {
  try {
    const messages = readDataFromMessagesFile();
    // Filter the messages where userId equals userId
    const selectedMessages = messages.filter(m => m.senderId === userId || m.receiverId === userId);

    selectedMessages.sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return 1;
      }
      if (a.createdAt > b.createdAt) {
        return -1;
      }
      return 0;
    });
    return selectedMessages;
  } catch (error) {
    throw new HTTPError(`Can't get messages from the user with id ${userId}! `, 404);
  }
};

/*
Get sent messages from user by id
*/
const getSentMessagesFromUserById = (userId) => {
  try {
    const messages = readDataFromMessagesFile();
    // Filter the messages where userId equals userId
    const selectedMessages = messages.filter(m => m.senderId === userId);

    selectedMessages.sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return 1;
      }
      if (a.createdAt > b.createdAt) {
        return -1;
      }
      return 0;
    });
    return selectedMessages;
  } catch (error) {
    throw new HTTPError(`Can't get sent messages from the user with id ${userId}! `, 404);
  }
};

/*
Get received messages from user by id
*/
const getReceivedMessagesFromUserById = (userId) => {
  try {
    const messages = readDataFromMessagesFile();
    // Filter the messages where userId equals userId
    const selectedMessages = messages.filter(m => m.receiverId === userId);

    selectedMessages.sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return 1;
      }
      if (a.createdAt > b.createdAt) {
        return -1;
      }
      return 0;
    });
    return selectedMessages;
  } catch (error) {
    throw new HTTPError(`Can't get received messages from the user with id ${userId}! `, 404);
  }
};

/*
Get messages between users
*/
const getMessagesBetweenUsers = (userId, friendId) => {
  try {
    const messages = readDataFromMessagesFile();
    // Filter the messages where userId equals userId
    // eslint-disable-next-line max-len
    const selectedMessages = messages.filter(m => (m.senderId === userId && m.receiverId === friendId) || (m.receiverId === userId && m.senderId === friendId));
    return selectedMessages;
  } catch (error) {
    throw new HTTPError(`Can't get messages between the user with id ${userId} and friend with id ${friendId}! `, 404);
  }
};

/*
Get a specific message
*/
const getMessageById = (id) => {
  try {
    const messages = readDataFromMessagesFile();
    const selectedMessage = messages.find(message => message.id === id);
    return selectedMessage;
  } catch (error) {
    throw new HTTPError(`Can't get message with id ${id}! `, 404);
  }
};

/*
Create a new message
*/
const createMessage = (message) => {
  try {
    // Read the messages.json file
    const messages = readDataFromMessagesFile();
    const messageToCreate = {
      ...message,
    };
    messageToCreate.id = uuidv4();
    messageToCreate.createdAt = Date.now();
    messages.push(messageToCreate);
    // Write message array to messages.json
    fs.writeFileSync(filePathMessages, JSON.stringify(messages, null, 2));
    return messageToCreate;
  } catch (error) {
    throw new HTTPError('Can\'t create message!', 500);
  }
};

/*
Update a specific message
*/
const updateMessage = (messageId, message) => {
  try {
    const messageToUpdate = {
      ...message,
    };
    messageToUpdate.modifiedAt = Date.now();
    // Read the messages.json file
    const messages = readDataFromMessagesFile();
    // Find the index of the message we want to update
    const findIndex = messages.findIndex(m => m.id === messageId);
    if (findIndex === -1) {
      throw new HTTPError(`Can't find the message with id ${messageId}!`, 404);
    }
    messages[findIndex] = {
      ...messages[findIndex],
      ...messageToUpdate,
    };
    // Write the messages away to the messages.json file
    fs.writeFileSync(filePathMessages, JSON.stringify(messages, null, 2));
    // Send response
    return messages[findIndex];
  } catch (error) {
    throw new HTTPError('Can\'t update message!', 500);
  }
};

/*
Delete a specific post
*/
const deleteMessage = (messageId) => {
  try {
    // Read the messages.json file
    const messages = readDataFromMessagesFile();
    // Find the index of the message we want to remove
    const findIndex = messages.findIndex(m => m.id === messageId);
    if (findIndex === -1) {
      throw new HTTPError(`Can't find the message with id ${messageId}!`, 404);
    }
    messages.splice(findIndex, 1);
    // Write the messages array to the messages.json file
    fs.writeFileSync(filePathMessages, JSON.stringify(messages, null, 2));
    // Send response
    return {
      message: `Successfully deleted the message with id ${messageId}!`,
    };
  } catch (error) {
    throw error;
  }
};

/*
Read matches.json file
*/
const readDataFromMatchesFile = () => {
  const data = fs.readFileSync(filePathMatches, {
    encoding: 'utf-8',
    flag: 'r',
  });
  const matches = JSON.parse(data);
  return matches;
};

/*
Get all matches
*/
const getMatches = () => {
  try {
    const matches = readDataFromMatchesFile();
    return matches;
  } catch (error) {
    throw new HTTPError('Can\'t get matches! ', 500);
  }
};

/*
Get match by userId and friendId
*/
const getMatchByIds = (userId, friendId) => {
  try {
    const matches = readDataFromMatchesFile();
    const matchForIds = matches.find(match => match.userId === userId && match.friendId === friendId);
    return matchForIds;
  } catch (error) {
    throw new HTTPError(`Can't get matches for userId ${userId} and friendId ${friendId}`, 500);
  }
};

/*
Get all matches for current user
*/
const getMatchesForUser = (userId) => {
  try {
    const matches = readDataFromMatchesFile();
    const matchesForUser = matches.filter(match => match.userId === userId);
    return matchesForUser;
  } catch (error) {
    throw new HTTPError(`Can't get matches for user with id ${userId}`, 500);
  }
};

/*
Create a new match for current user and friend with rating
*/
const createMatch = (userId, friendId, rating) => {
  try {
    const matches = readDataFromMatchesFile();
    const matchToCreate = {
      ...userId,
      ...friendId,
      ...rating,
      createdAt: Date.now(),
    };
    // Write match array to matches.json
    matches.push(matchToCreate);
    fs.writeFileSync(filePathMatches, JSON.stringify(matches, null, 2));
    return matchToCreate;
  } catch (error) {
    throw new HTTPError(`Cupid's aim is off, could not create new match between user ${userId} and ${friendId} with rating ${rating}`, 500);
  }
};

/*
Update the match for current user and friend with rating
*/
const updateMatch = (userId, friendId, rating) => {
  try {
    const matchToUpdate = {
      ...rating,
    };
    matchToUpdate.modifiedAt = Date.now();
    // Read the matches.json file
    const matches = readDataFromMatchesFile();
    // Find the index of the match we want to update
    const findIndex = matches.findIndex(m => m.userId === userId && m.friendId === friendId);
    if (findIndex === -1) {
      throw new HTTPError(`Can't find match between user with id ${userId} and friend with id ${friendId}!`, 404);
    }
    matches[findIndex] = {
      ...matches[findIndex],
      ...matchToUpdate,
    };
    // Write the matches away to the matches.json file
    fs.writeFileSync(filePathMatches, JSON.stringify(matches, null, 2));
    // Send response
    return matches[findIndex];
  } catch (error) {
    throw new HTTPError(`Cupid's aim is off, could not update the match between user ${userId} and ${friendId} with rating ${rating}`, 500);
  }
};

/*
Remove the match for current user and friend
*/
const deleteMatch = (userId, friendId) => {
  try {
    // Read the matches.json file
    const matches = readDataFromMatchesFile();
    // Find the index of the message we want to remove
    const findIndex = matches.findIndex(m => m.userId === userId && m.friendId === friendId);
    if (findIndex === -1) {
      throw new HTTPError(`Can't find the match between user with id ${userId} and friend ${friendId}!`, 404);
    }
    matches.splice(findIndex, 1);
    // Write the matches array to the matches.json file
    fs.writeFileSync(filePathMatches, JSON.stringify(matches, null, 2));
    // Send response
    return {
      message: `Successfully deleted the match between user with id ${userId} and friend ${friendId}!`,
    };
  } catch (error) {
    throw error;
  }
};

// Export all the methods of the data service
module.exports = {
  getUsers,
  getUserById,
  getMessages,
  getMessageById,
  getMessagesFromUserById,
  getSentMessagesFromUserById,
  getReceivedMessagesFromUserById,
  getMessagesBetweenUsers,
  createMessage,
  updateMessage,
  deleteMessage,
  getMatches,
  getMatchByIds,
  getMatchesForUser,
  createMatch,
  updateMatch,
  deleteMatch,
};
