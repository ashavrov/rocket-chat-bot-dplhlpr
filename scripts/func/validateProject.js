/**
 * Функция проверки названия проекта
 * @param name название проекта
 */
module.exports = (name) => {
  if (name == "") {
    throw ("Нужно ввести название проекта!");
  }
}