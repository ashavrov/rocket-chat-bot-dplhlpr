module.exports = (robot) => {
  robot.hear(/^--projects$/gi, function(res) {
    res.send(
      `Список актуальных проектов:
      1) e2e
	    2) 19Q2`
    )
  })
}
