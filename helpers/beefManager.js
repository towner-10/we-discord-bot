const fs = require('fs').promises;
const beef = require('../beef.json');

module.exports.getBeef = () => beef;

module.exports.addBeef = async (user1, user2) => {
    beef.push({ "id": beef.length + 1, "user-1": user1, "user-2": user2 });

    try {
        await fs.writeFile('./beef.json', JSON.stringify(beef), 'utf8');
        console.log(`✅ New beef added! ${user1} VS ${user2}`);

        return true;
    } catch (err) {
        return false;
    }
}
