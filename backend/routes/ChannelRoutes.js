const express = require('express');
const router = express.Router();
const {
  createChannel,
  getServerChannels,
  updateChannel,
  deleteChannel,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderChannels
} = require('../controllers/ChannelController');
const { authanticateJwt } = require('../controllers/userControllers');

// Channel routes
router.post('/', authanticateJwt, createChannel);
router.get('/server/:serverId', authanticateJwt, getServerChannels);
router.put('/:channelId', authanticateJwt, updateChannel);
router.delete('/:channelId', authanticateJwt, deleteChannel);

// Category routes
router.post('/category', authanticateJwt, createCategory);
router.put('/category/:categoryId', authanticateJwt, updateCategory);
router.delete('/category/:categoryId', authanticateJwt, deleteCategory);

// Order management
router.put('/reorder', authanticateJwt, reorderChannels);

module.exports = router; 