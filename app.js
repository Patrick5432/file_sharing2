const port = 3000
const DB = "./db/Users.sqlite"
const sqlite3 = require("sqlite3")
const cors = require("cors")
const express = require("express")
const app = express()

app.use(express.json())
app.use(cors())

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

app.post("/login", (req, res) => {
    const {auth_name, auth_password} = req.body

    db.get(`SELECT * FROM Users WHERE Name = ? AND Password = ?`,
    [auth_name, auth_password], (err, row) => {
        if (err) {
            res.status(500).send("Internal server error")
            return
        }
        if (row) {
            res.status(200).send("Login successful")
        }
        else {
            res.status(401).send("Invalid credentials")
        }
    })
})

//Регистрация пользователя

app.post("/registration", (req, res) => {
    const {signup_name, signup_pass} = req.body
    if (signup_name.trim() === "" || signup_pass.trim() === "") {
        res.status(400).send("Имя пользователя и пароль не могут быть пустыми.")
        return;
    }

    const checkUserQuery = "SELECT * FROM Users WHERE Name = ?"
    db.get(checkUserQuery, [signup_name], (err, row) => {
        if (err) {
            res.status(500).send("Ошибка при проверке пользователя")
            return;
        }
        if (row) {
            res.status(400).send("Пользователь с таким именем уже существует.")
            return;
        }

        const insertUserQuery = "INSERT INTO Users (Name, Password) VALUES (?,?)"
        db.run(insertUserQuery, [signup_name, signup_pass], (err) => {
            if (err) {
                res.status(500).send("Ошибка при регистрации пользователя")
                return;
            }
            res.redirect("./site/login/index.html")
        })
    })
})

//Получение всех пользователей

app.get("/users", async (req, res) => {
    db.all("SELECT * FROM Users", (err, rows) => {
        if (err) {
            console.error(err.message)
        }

        rows.forEach((row) => {
            res.send(row)
        })
    })
})


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