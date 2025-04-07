const connection = require('../config/database');

const Group = {
    getAllGroups: (callback) => {
        connection.query('SELECT groupName FROM grp', callback);
    },
    createGroup: (groupName, callback) => {
        connection.query('INSERT INTO grp (groupName) VALUES (?)', [groupName], callback);
    },
    selectGroupByName : (groupName, callback) => {
        connection.query('SELECT groupName FROM grp WHERE groupName = ?', [groupName], callback);
    },
};

module.exports = Group;