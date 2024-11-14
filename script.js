// Загрузка списка программ
async function loadPrograms() {
    const response = await fetch('/getPrograms');
    const programs = await response.json();
    const programsList = document.getElementById('programs');
    programsList.innerHTML = '';

    programs.forEach(program => {
        const li = document.createElement('li');
        li.innerHTML = `
            <h3>${program.name}</h3>
            <p>${program.description}</p>
            <p>${program.date}</p>
            <a href="/files/${program.file}" download>Download</a>
            <button class="delete" data-id="${program.id}">Delete</button>
        `;
        programsList.appendChild(li);
    });

    // Добавляем обработчики для удаления программ
    document.querySelectorAll('.delete').forEach(button => {
        button.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            await fetch(`/deleteProgram/${id}`, { method: 'DELETE' });
            loadPrograms(); // Перезагружаем список
        });
    });
}

// Добавление новой программы
document.getElementById('addProgramForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const programName = document.getElementById('programName').value;
    const programDescription = document.getElementById('programDescription').value;
    const programDate = document.getElementById('programDate').value;
    const fileUpload = document.getElementById('fileUpload').files[0];

    // Загружаем файл на сервер
    const formData = new FormData();
    formData.append('file', fileUpload);

    const uploadResponse = await fetch('/upload', { method: 'POST', body: formData });
    const uploadResult = await uploadResponse.json();

    if (uploadResult.success) {
        const fileLink = `/files/${uploadResult.fileName}`;
        const newProgram = {
            programName,
            programDescription,
            programDate,
            fileLink,
        };

        // Отправляем информацию о новой программе
        await fetch('/addProgram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProgram),
        });

        loadPrograms(); // Перезагружаем список
    } else {
        alert('File upload failed!');
    }

    // Очистка формы
    document.getElementById('addProgramForm').reset();
});

// Загружаем программы при открытии страницы
loadPrograms();
