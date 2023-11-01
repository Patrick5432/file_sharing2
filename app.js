const port = 3000
const DB = "./db/Users.sqlite"
const sqlite3 = require("sqlite3")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const express = require("express")
const { error } = require("console")
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
        const salt = bcrypt.genSaltSync(10)
        db.run(`CREATE TABLE Users (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT,
            Password TEXT,
            Salt TEXT,
            Token TEXT
        )`,
            (err) => {
                if (err) {
                    console.error("Таблица уже создана")
                }
                else {
                    const insert = 'INSERT INTO Users (Name, Password, Salt) VALUES (?,?,?)'
                    db.run(insert, ["TestUser", bcrypt.hashSync("TestUser", salt), salt])
                    console.log("Создание таблицы и заполнение данными")
                }
            })
    }
})

//Логин пользователя

app.post("/login", async (req, res) => {
    const { auth_name, auth_password } = req.body

    try {
        const checkUserQuery = "SELECT * FROM Users WHERE Name = ?"
        const user = await new Promise((resolve, reject) => {
            db.get(checkUserQuery, [auth_name], (err, row) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(row)
                }
            })
        })

        if (user) {
            const isPasswordValid = bcrypt.compareSync(auth_password, user.Password)
            if (isPasswordValid) {
                let token = user.Token // Получение текущего токена из базы данных

                if (!token) {
                    // Если у пользователя отсутствует токен, генерируем новый
                    token = jwt.sign({ userId: user.id }, 'секретный_ключ', { expiresIn: '1h' })

                    const updateUserQuery =
                        "UPDATE Users SET Token = ? WHERE Name = ?"
                    db.run(updateUserQuery, [token, auth_name], (err) => {
                        if (err) {
                            console.error(err.message)
                        }
                    })
                } else {
                    // Если у пользователя уже есть токен, удаляем старый и генерируем новый
                    jwt.verify(token, 'секретный_ключ', (err, decoded) => {
                        if (err) {
                            token = jwt.sign({ userId: user.id }, 'секретный_ключ', { expiresIn: '1h' })

                            const updateUserQuery =
                                "UPDATE Users SET Token = ? WHERE Name = ?"
                            db.run(updateUserQuery, [token, auth_name], (err) => {
                                if (err) {
                                    console.error(err.message)
                                }
                            })
                        }
                    })
                }

                res.status(200).json({ token })
            } else {
                res.status(401).send("Неверные учетные данные")
            }
        } else {
            res.status(401).send("Неверные учетные данные")
        }
    } catch (error) {
        res.status(500).send("Внутренняя ошибка сервера")
    }
})

//Регистрация пользователя

app.post("/registration", async (req, res) => {
    const { signup_name, signup_pass } = req.body
    if (signup_name.trim() === "" || signup_pass.trim() === "") {
        res.status(400).send("Имя пользователя и пароль не могут быть пустыми.")
        return
    }

    try {

        const checkUserQuery = "SELECT * FROM Users WHERE Name = ?"
        const row = await new Promise((resolve, reject) => {
            db.get(checkUserQuery, [signup_name], (err, row) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(row)
                }
            })
        })

        if (row) {
            res.status(400).send("Пользователь с таким именем уже существует.")
            return
        }

        const salt = bcrypt.genSaltSync(10)
        const data = {
            Username: signup_name,
            Password: bcrypt.hashSync(signup_pass, salt),
            Salt: salt,
        }

        const insertUserQuery =
            "INSERT INTO Users (Name, Password, Salt) VALUES (?,?,?)"

        await new Promise((resolve, reject) => {
            db.run(insertUserQuery, [data.Username, data.Password, data.Salt], (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })

        res.send("Пользователь успешно зарегистрирован.")

    } catch (error) {
        res.status(500).send("Произошла ошибка при попытке регистрации пользователя.")
    }
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