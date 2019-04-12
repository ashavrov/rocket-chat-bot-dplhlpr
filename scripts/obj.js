module.exports = (robot) => {
  robot.hear(/(^--obj.*)/gi, function(res) {
    try {
      //require
      var sqlite3 = require('sqlite3').verbose();
      var uuidv4 = require('uuid/v4');
      require('dotenv').config()
      //init
      var msgText = res.message.text;
      var userName = res.envelope.user.name;
      var db = new sqlite3.Database(process.env.DB_FILE);
      var msgId = uuidv4();
      var msgTextArr = msgText.split("\n");
      var jira = msgTextArr[0].replace(/--obj (.*\/){0,1}/g, '');
      var project = msgTextArr[1];
      var msqSqlText = 'INSERT INTO messages(id, user, text, project, jira) VALUES (?,?,?,?,?)';
      var objSqlText = 'INSERT INTO objects(id, parentId, type, name) VALUES (?,?,?,?)';
      //
      //Проверки шапки
      if (jira == "") {
        throw ("Некорректный номер Jira!");
      }
      if (project == "") {
        throw ("Некорректное название проекта!");
      }

      //вставляем запись с сообщением
      db.serialize(function() {
        db.exec("BEGIN");
        var stmt = db.prepare(msqSqlText);
        let msgSqlBinds = [msgId, userName, msgText, project, jira]
        stmt.run(msgSqlBinds);
        var objType = "";
        var objName = "";
        var objNameArr;
        //Вставляем записи с объектами сообщения
        for (var i = 2; i < msgTextArr.length; i++) {
          //пропускаем пустые строки
          if (msgTextArr[i].length == 0) {
            continue;
          }
          //парсим данные по объекту
          objType = msgTextArr[i].replace(/\:.*$/g, "");
          if (!validateObjType(objType.trim())) {
            throw ("Некорректный тип в строке: \r\n" + msgTextArr[i]);
          }
          //в названии может быть передан массив через запятую
          objNameArr = msgTextArr[i].replace(/^.*?\:/g, "").split(",");
          for (var j = 0; j < objNameArr.length; j++) {
            //проверка на корректность заполнения объекта
            if (!validateObjName(objNameArr[j].trim())) {
              throw ("Некорректное название объекта в строке: \r\n" + msgTextArr[i]);
            }
            let objSqlBinds = [uuidv4(), msgId, objType.trim(), objNameArr[j].trim()]
            stmt = db.prepare(objSqlText);
            stmt.run(objSqlBinds);
          }
        }
        stmt.finalize();
        db.exec("COMMIT");
      });
      db.close();
      //в конце ответ
      res.reply("\r\n done");
    } catch (e) {
      res.reply("\r\n" + e.toString());
      db.exec("ROLLBACK");
    } finally {

    }
  })
}

function validateObjName(name) {
  /*
  Функция проверки названия объекта
  IN name - название объекта
  */
  return name != "";
}

function validateObjType(name) {
  /*
  Функция проверки типа объекта
  IN name - название типа
  */
  return name != "";
}
