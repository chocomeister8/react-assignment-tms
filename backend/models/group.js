const connection = require('../config/database');

const Group = {
    getAllGroups: (callback) => {
        connection.query('SELECT groupName FROM grp', callback);
    },
    createGroup: (groupName) => {
        connection.query(
            'INSERT INTO grp (groupName) VALUES (?)',
            [groupName],
            callback
        );
    },
};

module.exports = Group;