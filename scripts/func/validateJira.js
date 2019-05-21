/*
Функция проверки названия jira
IN name - название объекта
*/
module.exports = (name) => {
  if (name == "") {
    throw ("Нужно ввести тикет Jira!");
  }
}
