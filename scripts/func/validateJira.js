/**
 * Функция проверки названия jira
 * @param name тикет jira
 */
module.exports = (name) => {
  if (name == "") {
    throw ("Нужно ввести тикет Jira!");
  }
}
