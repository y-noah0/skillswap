const express = require('express')
const { addMessage, getMessages, markMessageAsRead, deleteMessage, editMessage, addReaction, pinMessage, getPinnedMessages, createThread, getThreadsForUser, searchMessages } = require('../controllers/MessageController')
const router = express.Router()
const { authanticateJwt } = require('../controllers/userControllers')

router.post('/', addMessage)
router.get('/:chatId', getMessages)
router.put('/:messageId/read', authanticateJwt, markMessageAsRead)
router.put('/:messageId/delete', authanticateJwt, deleteMessage)

// New message features
router.put('/:messageId/edit', authanticateJwt, editMessage)
router.post('/:messageId/reaction', authanticateJwt, addReaction)
router.put('/:messageId/pin', authanticateJwt, pinMessage)
router.get('/:chatId/pinned', authanticateJwt, getPinnedMessages)

// Thread related endpoints
router.post('/:messageId/thread', authanticateJwt, createThread)
router.get('/threads/:userId', authanticateJwt, getThreadsForUser)

// Message search
router.post('/search', authanticateJwt, searchMessages)

module.exports = router
