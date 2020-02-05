/**
 * Function get Builder Number
 * @param jenkins Initialized Jenkins client
 * @param builderId builder id
 */


module.exports = function waitOnQueue(jenkins, builderId, callback) {
  var p = new Promise((resolve, reject) => {
    jenkins.queue.item(builderId, function(err, item) {
      if (err) reject(err);
      if (item.executable) {
        return resolve(item.executable.number);
      } else if (item.cancelled) {
        return reject("Cancelled")
      } else {
        setTimeout(function() {
          waitOnQueue(jenkins, builderId, callback);
        }, 1000);
      }
    });
  })
    .then(builderNum => {
      if (callback) callback(null, builderNum);
      return builderNum;
    })
    .catch(err => {
      if (callback) callback(err);
    });
  return p;
};
