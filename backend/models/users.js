const connection = require('../config/database'); // Import the connection

const User = {
    getAll: (callback) => {
        connection.query('SELECT username, email, password, isActive, user_groupName FROM user', callback);
    },
    getByUserName: (username, callback) => {
        connection.query('SELECT username FROM user WHERE username = ?', [username], callback);
    },
    create: (username, email, password, isActive, user_groupName, callback) => {
        connection.query(
            'INSERT INTO user (username, email, password, isActive, user_groupName) VALUES (?, ?, ?, ?, ?)',
            [username, email, password, isActive, user_groupName],
            callback
        );
    },
    update: (email, isActive, user_groupName, username, callback) => {
        connection.query(
            'UPDATE user SET email = ?, isActive = ?, user_groupName = ? WHERE username = ?',
            [email, isActive, user_groupName, username], callback
        );
    },
    updateWithPW :(email, password, isActive, user_groupName, username, callback) => {
        connection.query(
            'UPDATE user SET email = ?, password = ?, isActive = ?, user_groupName = ? WHERE username =?',
            [email, password, isActive, user_groupName, username], callback
        );
    }
};

module.exports = User;

