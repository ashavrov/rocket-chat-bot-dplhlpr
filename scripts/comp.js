//Moduls
const fs = require("fs");
require("dotenv").config();
var buildingJob = require("../scripts/func/buildingJob.js");
var validateObjectName = require("../scripts/func/validateObjectName.js");
var validateObjectType = require("../scripts/func/validateObjectType.js");
var jenkins = require("jenkins")({
  baseUrl:
    "http://" +
    process.env.JENKINS_USER +
    ":" +
    process.env.JENKINS_PASSWORD +
    "@" +
    process.env.JENKINS_URL,
  crumbIssuer: true
});

module.exports = robot => {
  robot.hear(/(^--comp.*)/gi, function(res) {
    var objType = "";
    var objName = "";
    var objNameArr;
    var msgText = res.message.text;
    var msgTextArr = msgText.split("\n");
    var userId = res.message.user.id;
    //Get Nickname of clinet from Rocket chat
    robot.adapter.api.get("users.info", { userId }).then(result => {
      if (result.success) {
        var userName = result.user.name;
        try {
          if (msgTextArr.length - 1 > 0) {
            for (var i = 1; i < msgTextArr.length; i++) {
              //Skip empty row
              if (msgTextArr[i].length === 0) {
                continue;
              }
              //Get Type from object
              objType = msgTextArr[i].split(":")[0].trim().replace(/\*/g, "");
              validateObjectType(objType);
              //Get data from object
              objName = msgTextArr[i].split(":")[1];
              if (objName !== undefined) {
                objNameArr = objName.split(",");
              } else {
                throw "Некорректный формат строки!";
              }
              //Validate object Name
              for (var j = 0; j < objNameArr.length; j++) {
                objName = objNameArr[j].trim().replace(/\*/g, "");
                validateObjectName(objName);
              }
              var dictParameters = { inputs: msgTextArr[i], name: userName };
              buildingJob(jenkins,"for-test/inc-compile-test",dictParameters,
                function(err) {
                  if (err) {
                    res.reply("\r\n*" + err + "*");
                  } else {
                    res.reply("\r\ndone");
                  }
                }
              );
            }
          } else {
            throw "Некорректный формат строки!";
          }
        } catch (e) {
          res.reply("\r\n*" + e.toString() + "*");
          return;
        }
      }
    });
  });
};
// module.exports = robot => {
//   robot.hear(/(^--comp.*)/gi, function(res) {
//     new Promise((resolve, reject) => {
//       jenkins.job.config("for-test/inc-compile-test", function(err, data) {
//         // if (data) return reject("hi man");
//         // if (data) return reject("hi man2");
//         resolve("data", "df");
//       });
//     })
//       .then((df, data) => {
//         console.log(df, data);
//       })
//       .catch(err => res.reply(err));
//   });
// };
