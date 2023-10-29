const port = 3000
const DB = "./db/Users.sqlite"
const sqlite3 = require("sqlite3")
const express = require("express")
const bodyParser = require("body-parser")
const app = express()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

//Создаем и подключаем бд
let db = new sqlite3.Database(DB, (err) => {
    if (err) {
        console.error(err.message)
        throw err
    }
    else {
        db.run(`CREATE TABLE Users (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT,
            Password TEXT
        )`,
            (err) => {
                if (err) {
                    console.error("Таблица уже создана")
                }
                else {
                    const insert = 'INSERT INTO Users (NAME, PASSWORD) VALUES (?,?)'
                    db.run(insert, ["TestUser", "TestUser"])
                    console.log("Создание таблицы и заполнение данными")
                }
            })
    }
})

//Логин пользователя

// app.post("/login", (req, res) => {
//     const {Username, Password} = req.body
//     console.log(Username + " " + Password)

//     db.all(`SELECT * FROM Users WHERE Name = ${Username} AND Password = ${Password}`, (err, row) => {

//     })
// })

//Регистрация пользователя

// app.post("/registation", (req, res) => {
//     const {name, password} = req.body
//     if (!(name === undefined && password === undefined)) {
//         res.status(400).send("Вы не заполнили поля")
//     }
//     const insert = "INSERT INTO Users (Name, Password) VALUES (?,?)"
//     db.run(insert, [name, password])
//     res.send(`Ваш логин: ${name} Ваш пароль ${password}`)
// })

//Получение всех пользователей

// app.get("/users", async (req, res) => {
//     db.all("SELECT * FROM Users", (err, rows) => {
//         if (err) {
//             console.error(err.message)
//         }

//         rows.forEach((row) => {
//             res.send(row)
//         })
//     })
// })


app.post("/", (req, res) => {
    const {username, password} = req.body
    console.log(username)
    console.log(password)
})

//Запускаем сервер
const start = () => {
    try {
        app.listen(port, () => {
            console.log(`Сервер запущен на порту ${port}`)
        })
    }
    catch (err) {
        console.error(err.message)
    }
}
start()