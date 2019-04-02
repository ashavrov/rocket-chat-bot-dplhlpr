module.exports = (robot) => {
  robot.hear(/(^--obj.*)/gi, function(res){
		try {
			var sqlite3 = require('sqlite3').verbose();
			var uuidv4 = require('uuid/v4');
			var db = new sqlite3.Database('//192.168.61.78/d$/DeployDb/msg.db3');
			//
			var msgText = res.message.text;
			var userName = res.envelope.user.name;
			var msgId = uuidv4();
			var msgTextArr = msgText.split("\n");
			var jira = msgTextArr[0].replace(/--obj (.*\/){0,1}/g, '');
      var project = msgTextArr[1];
			//
			var msqSqlText = 'INSERT INTO messages(id, user, text, project, jira) VALUES (?,?,?,?,?)';
			var objSqlText = 'INSERT INTO objects(id, parentId, type, name) VALUES (?,?,?,?)';
			//вставляем запись с сообщением
      db.serialize(function() {
        var stmt = db.prepare(msqSqlText);
  			let msgSqlBinds = [msgId, userName, msgText, project, jira]
  		  stmt.run(msgSqlBinds);
        var objType = "";
        var objName = "";
        var objNameArr;
        //Вставляем записи с объектами сообщения
  			for(var i = 2; i< msgTextArr.length; i++){
            //парсим данные по объекту
            objType = msgTextArr[i].replace(/\:.*$/g, "");
            //в названии может быть передан массив через запятую
            objNameArr = msgTextArr[i].replace(/^.*?\:/g, "").split(",");
            for(var j = 0; j<objNameArr.length; j++){
              let objSqlBinds = [uuidv4(), msgId, objType, objNameArr[j].trim()]
              stmt = db.prepare(objSqlText);
              stmt.run(objSqlBinds);
            }
  			}
        stmt.finalize();
      });
			db.close();
      //в конце ответ
			res.reply("done");
		} catch (e) {
				res.reply(e.toString());
		} finally {

		}
	})
}
