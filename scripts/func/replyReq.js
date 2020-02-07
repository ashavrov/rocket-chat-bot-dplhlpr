/**
 * Function execute job
 * @param res callback from robot.hear
 * @param jenkins Initialized Jenkins client
 * @param jobName job name (example: folder/job)
 * @param numBuilder (object) input parameter(s) for job in format { name: 'value' } (optional)
 */
module.exports = function replyReq(res, jenkins, jobName, numBuilder) {
  if (numBuilder) {
    const logStream = jenkins.build.logStream(jobName,numBuilder,"html",5000);
    logStream.on("end", err => {
      if (err) res.reply("\r\n" + err);
      jenkins.build.get(jobName, numBuilder, function(err, data) {
        var inputParameter = data.actions[0].parameters[0].value;
        if (err) throw err;
        if (data.result === "SUCCESS") {
          res.reply("\r\n*" + inputParameter.replace(':','*:') + " *скомпилилось успешно*");
        } else {
          res.reply("\r\n*" + inputParameter.replace(':','*:') + " *compile failed.*");
        }
      });
    });
  }
};
