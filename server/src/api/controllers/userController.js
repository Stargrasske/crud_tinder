/*
Import custom packages
*/
const dataService = require('../../services/dataService');
const { HTTPError, handleHTTPError } = require('../../utils');

/*
Get all users
*/
const getUsers = (req, res, next) => {
  try {
    // Get users from dataService
    const users = dataService.getUsers();
    res.status(200).json(users);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Get a specific user
*/
const getUserById = (req, res, next) => {
  try {
    // Get id from url
    const { userId } = req.params;
    // Get user with specific id
    const user = dataService.getUserById(userId);
    res.status(200).json(user);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Create a new user
*/
const createUser = (req, res, next) => {
  try {
    // Get the body from the response
    const user = req.body;
    const createdUser = dataService.createUser(user);
    // Send response
    res.status(201).json(createdUser);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Update a specific user
*/
const updateUser = (req, res, next) => {
  try {
    // Get the body from the response
    const user = req.body;
    // Get the user id from the parameters
    const { userId } = req.params;
    const updatedUser = dataService.updateUser(userId, user);
    res.status(200).json(updatedUser);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Delete a specific user
*/
const deleteUser = (req, res, next) => {
  try {
    // Get the user id from the parameters
    const { userId } = req.params;
    // Delete a user
    const user = dataService.deleteUser(userId);
    res.status(200).json(user);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

// Export the action methods = callbacks
module.exports = {
  createUser,
  deleteUser,
  getUsers,
  getUserById,
  updateUser,
};
