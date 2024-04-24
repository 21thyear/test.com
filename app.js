const express = require('express');
const https = require('https');
const fs = require('fs');
const mysql = require('mysql');

const app = express();

// Middleware для обработки JSON в теле запроса
app.use(express.json());

// Параметры подключения к базе данных
const connection = mysql.createConnection({
  host: '51.89.22.73',
  port: 3310, // Например, 3307
  user: 'root',
  password: 'Fw|0A4I10cjLfM8I',
  database: 'wildberries'
});

// Подключение к базе данных
connection.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных: ' + err.stack);
    return;
  }
  console.log('Успешное подключение к базе данных');
});

app.post("/insertData", (req, res) => {
  const data = req.body.rows;

  data.forEach((row) => {
      const { shop, item, cost, percent, keywords, count } = row;
      const query = "INSERT INTO keywords_data (item_name, added_by, shop, keywords, count, cost, percent) VALUES (?, 'CRM', ?, ?, ?, ?, ?)";
      
      connection.query(query, [item, shop, keywords, count, cost, percent], (err, result) => { // Поменяем порядок параметров и подставим их в нужном порядке
          if (err) {
              console.error('Ошибка выполнения запроса на вставку данных: ' + err.stack);
              return res.status(500).send("Ошибка выполнения запроса на вставку данных");
          }
      });
  });

  res.status(200).send("Данные успешно добавлены в таблицу keywords");
});


// Маршрут для выполнения запроса к базе данных
app.get('/', (req, res) => {
  // Выполнение запроса на выборку данных
  connection.query('SELECT * FROM accounts', (err, rows) => {
    let htmlResponse = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
    h1 {
      text-align: center;
      font-size: x-large;
      font-family: Verdana, Geneva, Tahoma, sans-serif;
      color: #252529;
    }
    .line {
      height: 2px;
      background-color: black;
    }
    .inputs-data {
      display: grid;
      grid-template-columns: max-content 1fr;
      grid-row-gap: 40px;
    }
    .button-container {
      margin-bottom: 20px;
      justify-content: center;
      display: flex;
    }
    .button-container button {
      width: 150px;
      height: 50px;
      margin-top: 55px;
      margin-bottom: 50px;
      margin-right: 15px;
    }
    .button-container button:last-child {
      margin-right: 0;
    }
    head, body {
      background-color: #414EFF;
    }
    input {
      border-radius: 8px;
      width: 90%;
    }
    </style>
    </head>
    <body>
    <h1>Добавление товара</h1>
    <div class="container">
    <div class="line"></div>
    <form action="" method="post" id="add-item-form">
    <div class="inputs-data">
    `;
    
    
    htmlResponse += `
    </div>
    <div class="button-container">
    <div class="inputs-data">
      <label for="example-text-input" class="col-xs-2 col-form-label">Название магазина:</label>
      <input type="text" class="shop" name="Название магазина" required>
      <label for="example-text-input" class="col-xs-2 col-form-label">Название товара:</label>
      <input type="text" class="item" name="Название товара" required>
      <label for="example-text-input" class="col-xs-2 col-form-label">Сумма товара:</label>
      <input type="number" class = "cost" name="Сумма товара" required>
      <label for="example-text-input" class="col-xs-2 col-form-label">Процент от суммы для выплаты:</label>
      <input type="number" class="percent" name="Процент от суммы для выплаты" max="100" required>
      <label for="example-text-input" class="col-xs-2 col-form-label">Ключевой запрос:</label>
      <input type="text" class="keywords" name="Ключевой запрос" required>
      <label for="example-text-input" class="col-xs-2 col-form-label">Кол-во:</label>
      <input type="number" class="count" name="Кол-во" required>
  </div>

    <button id="test" class="btn btn-danger" type="button" onclick="clearForm()">Отменить</button>
    <button class="btn btn-success" id="submit-btn" type="button">Подтвердить</button>
    </div>
    </form>
    </div>
    <script>
    function clearForm() {
      document.getElementById("add-item-form").reset();
      document.getElementById("submit-btn").disabled = true;
    }
    
    document.getElementById("submit-btn").addEventListener("click", async () => {
      const data = {
        rows: [{
          shop: document.getElementsByClassName("shop")[0].value,
          item: document.getElementsByClassName("item")[0].value,
          cost: document.getElementsByClassName("cost")[0].value,
          percent: document.getElementsByClassName("percent")[0].value,
          keywords: document.getElementsByClassName("keywords")[0].value,
          count: document.getElementsByClassName("count")[0].value
        }]
      };
    
      const response = await fetch("/insertData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        alert("Данные успешно добавлены!");
      } else {
        alert("Произошла ошибка при добавлении данных!");
      }
    });
    </script>
    </body>
    </html>
    `;
	res.send(htmlResponse);
    res.json(rows);
  });
});

// HTTPS сервер
const server = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/fustcup.pro/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/fustcup.pro/fullchain.pem')
}, app);

// Запуск HTTPS сервера
server.listen(2222, () => {
  console.log(`Сервер запущен на порту ${2222}`);
});
