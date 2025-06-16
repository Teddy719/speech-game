require('dotenv').config(); // ✅ 載入 .env 檔案

const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const path = require('path');

const app = express();  // ✅ 初始化 Express
app.use(cors());        // ✅ 使用 CORS middleware

const port = process.env.PORT || 3001;


// Middleware to parse JSON requests
app.use(express.json());

// MySQL connection configuration
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to MySQL database
connection.connect(function (err) {
    if (err) {
        console.error('Error connecting to MySQL database: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database as id ' + connection.threadId);
});

// 提供靜態文件目錄
app.use(express.static(path.join(__dirname, 'public')));

// 提供遊戲頁面的路由處理程序
app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ee.html'));
});

// /save-score 路由：保存分數和錯誤單字
app.post('/save-score', (req, res) => {
    const { playerName, score, mispronouncedWords, correctAnswerArray } = req.body;
    const correctAnswers = correctAnswerArray.join(', '); // 轉為字串
    const query = `INSERT INTO gamescores (playerName, score, mispronouncedWords, correctAnswers) VALUES (?, ?, ?, ?)`;
    connection.query(query, [playerName, score, JSON.stringify(mispronouncedWords), correctAnswers], (err, result) => {
        if (err) {
            console.error('保存分数时出错：', err);
            res.status(500).json({ success: false, message: '保存分数时出错' });
            return;
        }
        console.log('分数保存成功:', result);
        res.status(200).json({ success: true, message: '分数保存成功' });
    });
});

// /get-wrong-words 路由：根據學生姓名查詢所有歷史錯誤題目
app.get('/get-wrong-words', (req, res) => {
    const playerName = req.query.playerName;
    if (!playerName) {
        return res.status(400).json({ success: false, message: '缺少 playerName 參數' });
    }

    // 查詢該使用者的所有遊戲記錄
    const query = 'SELECT correctAnswers FROM gamescores WHERE playerName = ?';
    connection.query(query, [playerName], (err, results) => {
        if (err) {
            console.error('查詢錯誤：', err);
            return res.status(500).json({ success: false, message: '資料庫錯誤' });
        }

        console.log(`查詢到 ${results.length} 筆記錄`);  // 除錯用

        let wrongWords = [];
        // 將每筆記錄中的錯誤單字合併
        results.forEach(row => {
            if (row.correctAnswers) {
                const words = row.correctAnswers.split(',').map(word => word.trim().toLowerCase());
                wrongWords = wrongWords.concat(words);
            }
        });
        // 去重處理
        wrongWords = Array.from(new Set(wrongWords));

        // 定義與前端一致的 items 資料
        const items = [
            { name: "umbrella", imgSrc: "umbrella.jpg", audioSrc: "umbrella.mp3" },
            { name: "apple",    imgSrc: "apple.jpg",    audioSrc: "apple.mp3" },
            { name: "desk",     imgSrc: "desk.jpg",     audioSrc: "desk.mp3" },
            { name: "banana",   imgSrc: "banana.jpg",   audioSrc: "banana.mp3" },
            { name: "elephant", imgSrc: "elephant.jpg", audioSrc: "elephant.mp3" },
            { name: "flower",   imgSrc: "flower.jpg",   audioSrc: "flower.mp3" },
            { name: "chocolate",imgSrc: "chocolate.jpg",audioSrc: "chocolate.mp3" },
            { name: "airplane", imgSrc: "airplane.jpg", audioSrc: "airplane.mp3" },
            { name: "baby",     imgSrc: "baby.jpg",     audioSrc: "baby.mp3" },
            { name: "baseball", imgSrc: "baseball.jpg", audioSrc: "baseball.mp3" },
            { name: "bicycle",  imgSrc: "bicycle.jpg",  audioSrc: "bicycle.mp3" },
            { name: "butterfly",imgSrc: "butterfly.jpg",audioSrc: "butterfly.mp3" },
            { name: "hospital", imgSrc: "hospital.jpg", audioSrc: "hospital.mp3" },
            { name: "ice cream",imgSrc: "ice cream.jpg",audioSrc: "ice cream.mp3" },
            { name: "monkey",   imgSrc: "monkey.jpg",   audioSrc: "monkey.mp3" },
            { name: "orange",   imgSrc: "orange.jpg",   audioSrc: "orange.mp3" },
            { name: "japan",    imgSrc: "japan.jpg",    audioSrc: "japan.mp3" },
            { name: "noodles",  imgSrc: "noodles.jpg",  audioSrc: "noodles.mp3" },
            { name: "rice",     imgSrc: "rice.jpg",     audioSrc: "rice.mp3" },
            { name: "office",   imgSrc: "office.jpg",   audioSrc: "office.mp3" },
            { name: "piano",    imgSrc: "piano.jpg",    audioSrc: "piano.mp3" },
            { name: "panda",    imgSrc: "panda.jpg",    audioSrc: "panda.mp3" },
            { name: "rabbit",   imgSrc: "rabbit.jpg",   audioSrc: "rabbit.mp3" },
            { name: "sandwich", imgSrc: "sandwich.jpg", audioSrc: "sandwich.mp3" },
            { name: "tiger",    imgSrc: "tiger.jpg",    audioSrc: "tiger.mp3" },
            { name: "truck",    imgSrc: "truck.jpg",    audioSrc: "truck.mp3" },
            { name: "waiter",   imgSrc: "waiter.jpg",   audioSrc: "waiter.mp3" },
            { name: "watermelon",imgSrc: "watermelon.jpg",audioSrc: "watermelon.mp3" },
            { name: "zebra",    imgSrc: "zebra.jpg",    audioSrc: "zebra.mp3" },
            { name: "hamburger",imgSrc: "hamburger.jpg",audioSrc: "hamburger.mp3" }
            
        ];
        // 過濾出錯誤單字項目
        const wrongItems = items.filter(item => wrongWords.includes(item.name.toLowerCase()));
        return res.json(wrongItems);
    });
});

// 根路由
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});