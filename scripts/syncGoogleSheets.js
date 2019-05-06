//Модули
const fs = require('fs');
const readline = require('readline');
const {
  google
} = require('googleapis');
var sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

module.exports = (robot) => {
  robot.hear(/(^--syncGoogleSheet.*)/gi, function(res) {
    try {
      //Попытка получить данные для авторизации из локального файла
      fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        //Авторизация и после авторизации запуск функции добавления
        //записей в гугл таблицу
        authorize(JSON.parse(content), appendData);
        res.reply("\r\n done");
      });
    } catch (e) {
      res.reply("\r\n" + e.toString());
    } finally {

    }
  });
}
/*
Функция авторизации
credentials - файл с данными для авторизации
callback - что вызвать после
*/
function authorize(credentials, callback) {
  const {
    client_secret,
    client_id,
    redirect_uris
  } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);
  // проверяем наличие токена авторизации
  fs.readFile('token.json', (err, token) => {
    //если не смогли считать токен, запрашиваем новый
    if (err) return getNewToken(oAuth2Client, callback);
    //создаем авторизационные данные и вызываем функцию
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}
/*
Функция получения токена
oAuth2Client - google.auth.OAuth2
callback - что вызвать после
*/
function getNewToken(oAuth2Client, callback) {
  //генерируем url для авторизации
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/spreadsheets',
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    //берем токен
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      //сохраняем токен на диск
      fs.writeFile('token.json', JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', 'token.json');
      });
      callback(oAuth2Client);
    });
  });
}
/*
Функция синхронизации данных
auth -аутентификационные данные google.auth.OAuth2
*/
function appendData(auth) {
  const sheets = google.sheets({
    version: 'v4',
    auth
  });
  //запрос на извлечение объектов
  let sqlData = `
      SELECT DISTINCT o.TYPE, o.name, m.jira,
           m."user" user, 'Новый' status,
           m.created created
      FROM objects o
      JOIN messages m
        ON o.parentId = m.id
     WHERE m.created > (SELECT value
                          FROM settings s
                         WHERE s.name = 'lastSyncDate')
    ORDER BY m.created ASC;
                 `;
  //извлекаем объекты
  let db = new sqlite3.Database(process.env.DB_FILE);
  db.all(sqlData, [], (err, rows) => {
    if (err) {
      throw err;
    }
    created = "";
    //каждый объект апендим в гугл табличку
    for (var i = 0; i < rows.length; i++) {
      let val = {
        spreadsheetId: "1mOO-P191yJRdEZ49bTUU8DDWpxGOuTHs57DVjfs-_eE", //Id таблицы
        range: 'Sheet1', //диапазон, в данном случае лист
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [
            [
              rows[i].status,
              rows[i].type,
              rows[i].name,
              rows[i].jira,
              rows[i].user
            ]
          ],
        },
        auth: auth
      };
      setTimeout(() => sheets.spreadsheets.values.append(val, (err, response) => {
        if (err) return console.error(err);
      }), 100*i);
    }
    //если записи были, то апдейтим lastSyncDate на дату
    //создания последнего объекта
    if (rows && rows.length > 0) {
      created = rows[rows.length - 1].created;
      let sqlSettingsUpdate = "UPDATE settings SET value = '" + created + "' WHERE name = 'lastSyncDate';";
      db.run(sqlSettingsUpdate, [], (err, rows) => {
        if (err) {
          throw err;
        }
      });
    }
  });
}
