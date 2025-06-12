const cors = require('cors');
app.use(cors());
const express = require('express');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = 3001;

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
            { name: "banana",   imgSrc: "banana.jpg",   audioSrc: "banana.mp3" },
            { name: "elephant", imgSrc: "elephant.jpg", audioSrc: "elephant.mp3" },
            { name: "frog",     imgSrc: "frog.jpg",     audioSrc: "frog.mp3" },
            { name: "egg",      imgSrc: "egg.jpg",      audioSrc: "egg.mp3" },
            { name: "eye",      imgSrc: "eye.jpg",      audioSrc: "eye.mp3" },
            { name: "ear",      imgSrc: "ear.jpg",      audioSrc: "ear.mp3" },
            { name: "desk",     imgSrc: "desk.jpg",     audioSrc: "desk.mp3" },
            { name: "dog",      imgSrc: "dog.jpg",      audioSrc: "dog.mp3" },
            { name: "dress",    imgSrc: "dress.jpg",    audioSrc: "dress.mp3" },
            { name: "drum",     imgSrc: "drum.jpg",     audioSrc: "drum.mp3" },
            { name: "fork",     imgSrc: "fork.jpg",     audioSrc: "fork.mp3" },
            { name: "football", imgSrc: "football.jpg", audioSrc: "football.mp3" },
            { name: "flower",   imgSrc: "flower.jpg",   audioSrc: "flower.mp3" },
            { name: "airplane", imgSrc: "airplane.jpg", audioSrc: "airplane.mp3" },
            { name: "baby",     imgSrc: "baby.jpg",     audioSrc: "baby.mp3" },
            { name: "baseball", imgSrc: "baseball.jpg", audioSrc: "baseball.mp3" },
            { name: "bicycle",  imgSrc: "bicycle.jpg",  audioSrc: "bicycle.mp3" },
            { name: "butterfly",imgSrc: "butterfly.jpg",audioSrc: "butterfly.mp3" },
            { name: "box",      imgSrc: "box.jpg",      audioSrc: "box.mp3" },
            { name: "cake",     imgSrc: "cake.jpg",     audioSrc: "cake.mp3" },
            { name: "cookies",  imgSrc: "cookies.jpg",  audioSrc: "cookies.mp3" },
            { name: "chair",    imgSrc: "chair.jpg",    audioSrc: "chair.mp3" },
            { name: "clock",    imgSrc: "clock.jpg",    audioSrc: "clock.mp3" },
            { name: "chocolate",imgSrc: "chocolate.jpg",audioSrc: "chocolate.mp3" },
            { name: "gift",     imgSrc: "gift.jpg",     audioSrc: "gift.mp3" },
            { name: "grape",    imgSrc: "grape.jpg",    audioSrc: "grape.mp3" },
            { name: "glasses",  imgSrc: "glasses.jpg",  audioSrc: "glasses.mp3" },
            { name: "grandma",  imgSrc: "grandma.jpg",  audioSrc: "grandma.mp3" },
            { name: "hand",     imgSrc: "hand.jpg",     audioSrc: "hand.mp3" },
            { name: "hat",      imgSrc: "hat.jpg",      audioSrc: "hat.mp3" },
            { name: "hippo",    imgSrc: "hippo.jpg",    audioSrc: "hippo.mp3" },
            { name: "house",    imgSrc: "house.jpg",    audioSrc: "house.mp3" },
            { name: "hospital", imgSrc: "hospital.jpg", audioSrc: "hospital.mp3" },
            { name: "ice cream",imgSrc: "ice cream.jpg",audioSrc: "ice cream.mp3" },
            { name: "jacket",   imgSrc: "jacket.jpg",   audioSrc: "jacket.mp3" },
            { name: "japan",    imgSrc: "japan.jpg",    audioSrc: "japan.mp3" },
            { name: "juice",    imgSrc: "juice.jpg",    audioSrc: "juice.mp3" },
            { name: "key",      imgSrc: "key.jpg",      audioSrc: "key.mp3" },
            { name: "kite",     imgSrc: "kite.jpg",     audioSrc: "kite.mp3" },
            { name: "knife",    imgSrc: "knife.jpg",    audioSrc: "knife.mp3" },
            { name: "koala",    imgSrc: "koala.jpg",    audioSrc: "koala.mp3" },
            { name: "lamp",     imgSrc: "lamp.jpg",     audioSrc: "lamp.mp3" },
            { name: "lemon",    imgSrc: "lemon.jpg",    audioSrc: "lemon.mp3" },
            { name: "lion",     imgSrc: "lion.jpg",     audioSrc: "lion.mp3" },
            { name: "leg",      imgSrc: "leg.jpg",      audioSrc: "leg.mp3" },
            { name: "lake",     imgSrc: "lake.jpg",     audioSrc: "lake.mp3" },
            { name: "mailman",  imgSrc: "mailman.jpg",  audioSrc: "mailman.mp3" },
            { name: "marker",   imgSrc: "marker.jpg",   audioSrc: "marker.mp3" },
            { name: "monkey",   imgSrc: "monkey.jpg",   audioSrc: "monkey.mp3" },
            { name: "moon",     imgSrc: "moon.jpg",     audioSrc: "moon.mp3" },
            { name: "nurse",    imgSrc: "nurse.jpg",    audioSrc: "nurse.mp3" },
            { name: "nose",     imgSrc: "nose.jpg",     audioSrc: "nose.mp3" },
            { name: "noodles",  imgSrc: "noodles.jpg",  audioSrc: "noodles.mp3" },
            { name: "nine",     imgSrc: "nine.jpg",     audioSrc: "nine.mp3" },
            { name: "orange",   imgSrc: "orange.jpg",   audioSrc: "orange.mp3" },
            { name: "office",   imgSrc: "office.jpg",   audioSrc: "office.mp3" },
            { name: "panda",    imgSrc: "panda.jpg",    audioSrc: "panda.mp3" },
            { name: "pants",    imgSrc: "pants.jpg",    audioSrc: "pants.mp3" },
            { name: "peach",    imgSrc: "peach.jpg",    audioSrc: "peach.mp3" },
            { name: "piano",    imgSrc: "piano.jpg",    audioSrc: "piano.mp3" },
            { name: "pie",      imgSrc: "pie.jpg",      audioSrc: "pie.mp3" },
            { name: "pig",      imgSrc: "pig.jpg",      audioSrc: "pig.mp3" },
            { name: "pizza",    imgSrc: "pizza.jpg",    audioSrc: "pizza.mp3" },
            { name: "pumpkin",  imgSrc: "pumpkin.jpg",  audioSrc: "pumpkin.mp3" },
            { name: "policeofficer",imgSrc: "policeofficer.jpg",audioSrc: "policeofficer.mp3" },
            { name: "rabbit",   imgSrc: "rabbit.jpg",   audioSrc: "rabbit.mp3" },
            { name: "rain",     imgSrc: "rain.jpg",     audioSrc: "rain.mp3" },
            { name: "rainbow",  imgSrc: "rainbow.jpg",  audioSrc: "rainbow.mp3" },
            { name: "refrigerator",  imgSrc: "refrigerator.jpg",  audioSrc: "refrigerator.mp3" },
            { name: "rice",     imgSrc: "rice.jpg",     audioSrc: "rice.mp3" },
            { name: "robot",    imgSrc: "robot.jpg",    audioSrc: "robot.mp3" },
            { name: "ruler",    imgSrc: "ruler.jpg",    audioSrc: "ruler.mp3" },
            { name: "salad",    imgSrc: "salad.jpg",    audioSrc: "salad.mp3" },
            { name: "sandwich", imgSrc: "sandwich.jpg", audioSrc: "sandwich.mp3" },
            { name: "sheep",    imgSrc: "sheep.jpg",    audioSrc: "sheep.mp3" },
            { name: "snake",    imgSrc: "snake.jpg",    audioSrc: "snake.mp3" },
            { name: "sun",      imgSrc: "sun.jpg",      audioSrc: "sun.mp3" },
            { name: "swim",     imgSrc: "swim.jpg",     audioSrc: "swim.mp3" },
            { name: "sofa",     imgSrc: "sofa.jpg",     audioSrc: "sofa.mp3" },
            { name: "taxi",     imgSrc: "taxi.jpg",     audioSrc: "taxi.mp3" },
            { name: "tiger",    imgSrc: "tiger.jpg",    audioSrc: "tiger.mp3" },
            { name: "train",    imgSrc: "train.jpg",    audioSrc: "train.mp3" },
            { name: "turtle",   imgSrc: "turtle.jpg",   audioSrc: "turtle.mp3" },
            { name: "truck",    imgSrc: "truck.jpg",    audioSrc: "truck.mp3" },
            { name: "TV",       imgSrc: "TV.jpg",       audioSrc: "TV.mp3" },
            { name: "tree",     imgSrc: "tree.jpg",     audioSrc: "tree.mp3" },
            { name: "toy",      imgSrc: "toy.jpg",      audioSrc: "toy.mp3" },
            { name: "watch",    imgSrc: "watch.jpg",    audioSrc: "watch.mp3" },
            { name: "watermelon",imgSrc: "watermelon.jpg",audioSrc: "watermelon.mp3" },
            { name: "whale",    imgSrc: "whale.jpg",    audioSrc: "whale.mp3" },
            { name: "wind",     imgSrc: "wind.jpg",     audioSrc: "wind.mp3" },
            { name: "wall",     imgSrc: "wall.jpg",     audioSrc: "wall.mp3" },
            { name: "water",    imgSrc: "water.jpg",    audioSrc: "water.mp3" },
            { name: "waiter",   imgSrc: "waiter.jpg",   audioSrc: "waiter.mp3" },
            { name: "zoo",      imgSrc: "zoo.jpg",      audioSrc: "zoo.mp3" },
            { name: "zero",     imgSrc: "zero.jpg",     audioSrc: "zero.mp3" },
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