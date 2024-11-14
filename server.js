const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const cors = require('cors');
app.use(cors());


// Папка для хранения файлов
const UPLOADS_DIR = path.join(__dirname, 'files');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const fileName = Date.now() + fileExtension; // Создаем уникальное имя для файла
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

// Middleware для сервера
app.use(express.static('public'));
app.use(express.json());

// Загрузка файла
app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        res.json({ success: true, fileName: req.file.filename });
    } else {
        res.status(400).json({ success: false, message: 'File upload failed' });
    }
});

// Чтение данных о программах
const getProgramsData = () => {
    try {
        const data = fs.readFileSync('database.json');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// Запись данных о программах
const saveProgramsData = (data) => {
    fs.writeFileSync('database.json', JSON.stringify(data, null, 2));
};

// Отправка списка программ
app.get('/getPrograms', (req, res) => {
    const programs = getProgramsData();
    res.json(programs);
});

// Добавление новой программы
app.post('/addProgram', (req, res) => {
    const { programName, programDescription, programDate, fileLink } = req.body;
    const programs = getProgramsData();
    
    // Добавляем новую программу
    const newProgram = {
        id: Date.now(), // Уникальный ID
        name: programName,
        description: programDescription,
        date: programDate,
        file: fileLink,
    };

    programs.push(newProgram);
    saveProgramsData(programs);
    res.json({ success: true, message: 'Program added successfully' });
});

// Удаление программы
app.delete('/deleteProgram/:id', (req, res) => {
    const { id } = req.params;
    let programs = getProgramsData();
    programs = programs.filter(program => program.id != id);
    saveProgramsData(programs);
    res.json({ success: true, message: 'Program deleted successfully' });
});

// Стартуем сервер
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
