const { sql, conectar } = require('../db/connection.js');

async function getFriends(userId) {
    const pool = await conectar();
    
    const result = await pool.request()
        .input("UserId", sql.Int, userId)
        .query("SELECT U.ID, U.Nombre, U.Username FROM Amigos A JOIN Usuarios U ON (U.ID = A.Usuario1_ID OR U.ID = A.Usuario2_ID) WHERE @UserId IN (A.Usuario1_ID, A.Usuario2_ID) AND U.ID <> @UserId");
    console.log("hasta service")
    return result.recordset;
}

async function addFriend(userId, friendId) {
    const pool = await conectar();
    const result = await pool.request()
        .input("UserId", sql.Int, userId)
        .input("FriendId", sql.Int, friendId)
        .query("INSERT INTO Amigos VALUES (@UserId, @FriendId)")
    return result.recordset;
}

async function delFriend(userId, friendId) {
    const pool = await conectar();
    const result = await pool.request()
        .input("UserId", sql.Int, userId)
        .input("FriendId", sql.Int, friendId)
        .query("DELETE * FROM Amigos A JOIN Usuarios U ON (U.ID = A.Usuario1_ID OR U.ID = A.Usuario2_ID) WHERE (A.Usuario1_ID = @UserId AND A.Usuario2_ID = @FriendId) OR (A.Usuario2_ID = @UserId AND A.Usuario1_ID = @FriendId)")
    return result.recordset;
}

async function searchFriends(friend) {
    const pool = await conectar();
    const result = await pool.request()
        .input("Friend", sql.VarChar, friend)
        .query("SELECT * FROM Usuarios WHERE Nombre LIKE @Friend")
    return result.recordset;
}

module.exports = {getFriends, addFriend, delFriend, searchFriends}