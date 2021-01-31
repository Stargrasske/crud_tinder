/*
Import custom packages
*/
const dataService = require('../../services/dataService');
const { HTTPError, handleHTTPError } = require('../../utils');

/*
Get all matches
*/
const getMatches = (req, res, next) => {
  try {
    // Get matches from dataService
    const matches = dataService.getMatches();
    res.status(200).json(matches);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Get a specific match
*/
const getMatchByIds = (req, res, next) => {
  try {
    const { userId, friendId } = req.params;
    const match = dataService.getMatchByIds(userId, friendId);
    res.status(200).json(match);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Get matches from a specific user
*/
const getMatchesFromUserById = (req, res, next) => {
  try {
    // Get userId from url
    const { userId } = req.params;
    // Get matches from a specific user
    const matches = dataService.getMatchesForUser(userId);
    res.status(200).json(matches);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Create a new match
*/
const createMatch = (req, res, next) => {
  try {
    const match = req.body;
    const createdMatch = dataService.createMatch(match);
    res.status(201).json(createdMatch);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Update a specific match
*/
const updateMatch = (req, res, next) => {
  try {
    const rating = req.body;
    const { senderId, receiverId } = req.params;
    const match = dataService.updateMatch(senderId, receiverId, rating);
    res.status(200).json(match);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Delete a specific match
*/
const deleteMatch = (req, res, next) => {
  try {
    // Get match to delete
    const { senderId, receiverId } = req.params;
    const match = dataService.deleteMatch(senderId, receiverId);
    res.status(200).json(match);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

// Export the action methods = callbacks
module.exports = {
  createMatch,
  deleteMatch,
  getMatches,
  getMatchByIds,
  getMatchesFromUserById,
  updateMatch,
};
