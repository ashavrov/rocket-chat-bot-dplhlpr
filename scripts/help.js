//Модули
const fs = require("fs");

module.exports = (robot) => {
    robot.hear(/^--help$/gi, function(res) {
        fs.readFile("scripts/files/help.txt", "utf8", (err, content) => {
            if (err) {
                content = "Не удалось загрузить help.txt";
            }
            res.send(content);
        });
    });
};