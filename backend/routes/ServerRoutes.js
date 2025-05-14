const express = require('express');
const router = express.Router();
const {
  createServer,
  getUserServers,
  getServerDetails,
  updateServer,
  deleteServer,
  createInviteCode,
  joinServer,
  leaveServer,
  manageRole,
  deleteRole,
  assignRole
} = require('../controllers/ServerController');
const { authanticateJwt } = require('../controllers/userControllers');

// Server management
router.post('/', authanticateJwt, createServer);
router.get('/', authanticateJwt, getUserServers);
router.get('/:serverId', authanticateJwt, getServerDetails);
router.put('/:serverId', authanticateJwt, updateServer);
router.delete('/:serverId', authanticateJwt, deleteServer);

// Server invites
router.post('/:serverId/invite', authanticateJwt, createInviteCode);
router.post('/join/:inviteCode', authanticateJwt, joinServer);
router.post('/:serverId/leave', authanticateJwt, leaveServer);

// Role management
router.post('/:serverId/roles', authanticateJwt, manageRole);
router.put('/:serverId/roles', authanticateJwt, manageRole);
router.delete('/:serverId/roles/:roleId', authanticateJwt, deleteRole);
router.put('/:serverId/members/:userId/roles/:roleId', authanticateJwt, assignRole);

module.exports = router; 