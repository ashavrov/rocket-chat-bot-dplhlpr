//Модули
var sqlite3 = require('sqlite3').verbose();
var uuidv4 = require('uuid/v4');
require('dotenv').config();
var sem = require('semaphore')(1);
//Локальные модули
var validateProject = require('../scripts/func/validateProject.js');
var validateJira = require('../scripts/func/validateJira.js');
var validateObjectName = require('../scripts/func/validateObjectName.js');
var validateObjectType = require('../scripts/func/validateObjectType.js');

module.exports = (robot) => {
    robot.hear(/(^--obj.*)/gi, function(res) {
        //init
        sem.take(function() {
            try {
                var msgText = res.message.text;
                var userName = res.envelope.user.name;
                var db = new sqlite3.Database(process.env.DB_FILE);
                var msgId = uuidv4();
                var msgTextArr = msgText.split("\n");
                var jira = msgTextArr[0].replace(/--obj(.*\/){0,1}/g, '').replace(/\r/g, '').trim();
                var project = ((msgTextArr[1] == undefined) ? "" : msgTextArr[1]);
                var msqSqlText = `INSERT INTO messages(id, user, text, project, jira)
                          VALUES (?,?,?,?,?);`;
                var objSqlText = `INSERT INTO objects(id, parentId, type, name, adm_flg)
                          VALUES (?,?,?,?,?);`;
                //Проверки шапки
                try {
                    validateJira(jira);
                    validateProject(project);
                } catch (e) {
                    res.reply("\r\n" + e.toString());
                    return
                }
                //
                //вставляем запись с сообщением
                try {
                    var objType = "";
                    var objName = "";
                    var objNameArr;
                    //Вставляем записи с объектами сообщения
                    for (var i = 2; i < msgTextArr.length; i++) {
                        try {
                            //пропускаем пустые строки
                            if (msgTextArr[i].length == 0) {
                                continue;
                            }
                            //парсим данные по объекту
                            objType = msgTextArr[i].split(":")[0].trim().replace(/\*/g, "");
                            validateObjectType(objType);
                            //в названии может быть передан массив через запятую
                            objName = msgTextArr[i].split(":")[1];
                            if (objName !== undefined) {
                                objNameArr = objName.split(",");
                            } else {
                                throw ("Некорректный формат строки!");
                            }

                            for (var j = 0; j < objNameArr.length; j++) {
                                objName = objNameArr[j].trim().replace(/\*/g, "");
                                //проверка на корректность заполнения объекта
                                validateObjectName(objName);
                                let objSqlBinds = [
                                    uuidv4(),
                                    msgId,
                                    objType,
                                    objName,
                                    "N"
                                ]
                                let stmtObj = db.prepare(objSqlText);
                                db.serialize(function() {
                                    stmtObj.run(objSqlBinds);
                                    stmtObj.finalize();
                                });

                            }
                        } catch (e) {
                            throw (e.toString() + "\r\n" + "в строке: \r\n" + msgTextArr[i])
                        }
                    }
                    let stmtMsg = db.prepare(msqSqlText);
                    let msgSqlBinds = [msgId, userName, msgText, project, jira]
                    db.serialize(function() {
                        stmtMsg.run(msgSqlBinds);
                        stmtMsg.finalize();
                    });
                    res.reply("\r\n done");

                } catch (e) {
                    res.reply("\r\n" + e.toString());
                    rollback(msgId);
                }
                db.close();
            } catch (e) {
                console.log(e);
            } finally {
                sem.leave();
            }
        });
    })
}

/**
 * rollback - Функция отката объектов
 *
 * @param msgId Id сообщения
 */
function rollback(msgId) {
    //Откат происходит после выполнения в отдельном инсте,что бы избежать гонки
    setTimeout(function() {
        sem.take(function() {
            var db = new sqlite3.Database(process.env.DB_FILE);
            var rlbckSqlText = `DELETE FROM objects WHERE parentId='` + msgId + `'`;
            let stmtRlbck = db.prepare(rlbckSqlText);
            let rlbckSqlBinds = [msgId]
            db.serialize(function() {
                stmtRlbck.run();
                stmtRlbck.finalize();
            });
            sem.leave();
        });
    }, 5000);
}