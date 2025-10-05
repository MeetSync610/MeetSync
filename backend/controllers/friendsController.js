const friendsService = require('../services/friendsService.js')

async function getFriends(req, res) {
    try {
        const {userId} = req.params;
        const data = await friendsService.getFriends(userId);
        
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function addFriend(req, res) {
    try {
        const {userId, friendId} = req.body;
        const data = await friendsService.addFriend(userId, friendId);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function delFriend(req, res) {
    try {
        const {userId, friendId} = req.body;
        const data = await friendsService.delFriend(userId, friendId);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function searchFriends(req, res) {
    try {
        const { friend } = req.query;
        const data = await friendsService.searchFriends(friend);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {getFriends, addFriend, delFriend, searchFriends}