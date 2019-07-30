//Модули
var sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

module.exports = (robot) => {
    robot.hear(/^--projects$/gi, function(res) {
        var answer = "Список актуальных проектов:\r\n";
        let sqlData = "SELECT name FROM projects";
        //извлекаем проекты
        let db = new sqlite3.Database(process.env.DB_FILE);
        db.all(sqlData, [], (err, rows) => {
            if (err) {
                throw err;
            }
            for (var i = 0; i < rows.length; i++) {
                answer += (i + 1) + ") " + rows[i].name + "\r\n";
            }
            res.send(answer);
        });
        db.close();
    });
};