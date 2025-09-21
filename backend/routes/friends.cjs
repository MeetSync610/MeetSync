const express = require('express');
const router = express.Router();

let mockFriends = [{name: "buscado", username: "buscado", isFriend: false}, {name: "man", username: "man", isFriend: true}]
let mockFriends2 = [{name: "amigo", username: "amigo", isFriend: true}, {name: "man", username: "man", isFriend: true}]

router.get('/friends', (req, res) => {
  console.log(mockFriends2);
  res.json(mockFriends2)
});

router.get('/friends/:search', (req, res) => {
  const { search } = req.params;
  console.log(mockFriends);
  res.json(mockFriends)
});

module.exports = router;