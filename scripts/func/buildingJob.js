/**
 * Function execute job
 * @param jenkins Initialized Jenkins client
 * @param jobName job name (example: folder/job)
 * @param parametersObj (object) input parameter(s) for job in format { name: 'value' } (optional)
 *
 * More information you can find here: https://www.npmjs.com/package/jenkins
 */
const xmlQuery = require("xml-query");
const XmlReader = require("xml-reader");

module.exports = (jenkins, jobName, parametersObj, callback) => {
  new Promise((resolve, reject) => {
    if (jenkins) {
      if (!jobName) {
        return reject("Enter job name");
      }
      jenkins.job.config(jobName, function(err, data) {
        if (err) return reject(err);
        if (typeof parametersObj != "object" && !!parametersObj) {
          return reject("Argumet 'Parameters' has to be 'object' type ");
        }
        //Validation of Job arguments
        if (!!parametersObj) {
          var xml = data;
          const Ast = XmlReader.parseSync(xml);
          var arrInputJobParam = xmlQuery(Ast).find("name").map(Ast =>  xmlQuery(Ast).find("name").text());
          var sLackJobArguments = [];
          for (var key in parametersObj) {
            if (parametersObj.hasOwnProperty(key)) {
              var whar = arrInputJobParam.includes(key);
              if (!arrInputJobParam.includes(key)) {
                sLackJobArguments.push(key);
              }
            }
          }
          if (sLackJobArguments.length > 0) {
            return reject(
              "Wrong arguments for this job: " + sLackJobArguments.join(",")
            );
          }
        }
        resolve(data);
      });
    } else {
      return reject("Couldn't connect to the host");
    }
  })
    .then(() => {
      jenkins.job.exists(jobName, function(err, data) {
        if (err) return reject(err);
        var existJob = data;
        if(existJob){
            if(parametersObj){
                jenkins.job.build({ name: jobName, parameters: parametersObj }, function(err, data) {
                    if (err) return reject(err);
                });
            }
            else(
               jenkins.job.build(jobName, function(err, data) {
                    if (err) return reject(err);
                })
            )
        }
      });
    })
    .then(data => callback(null, data))
    .catch(err => {
      callback(err);
    });
};
