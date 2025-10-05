const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController.js');

router.get('/:id', friendsController.getFriends);

router.get('/', friendsController.searchFriends);

router.post('/', friendsController.addFriend);

router.delete('/', friendsController.delFriend)

module.exports = router;