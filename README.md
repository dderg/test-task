[![Build Status](https://travis-ci.org/prog666/test-task.svg?branch=master)](https://travis-ci.org/prog666/test-task)

Задержку генератора можно выставить в файле `config.json`

С Redis работал в первый раз, возможно существуют лучшие методы для работы с ним.

Ничего не гуглил кроме документации redis

Для проверки 1млн сообщений использовал
```bash
node index.js & node index.js
```

Тестировал в node.js версии '4.1.2'

Мне кажется проверку на существование генератора можно сделать лучше, сейчас попахивает костылями.
