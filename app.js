const tasks = [];

function addTask() {
    const taskInput = document.getElementById("taskInput");
    const taskText = taskInput.value.trim();

    if (taskText !== "") {
        tasks.push({ text: taskText, completed: false });
        displayTasks();
        saveTasks();
        taskInput.value = "";
    }
}

function displayTasks() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const listItem = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            displayTasks();
            saveTasks();
        });

        const taskText = document.createElement("span");
        taskText.innerText = task.text;

        listItem.appendChild(checkbox);
        listItem.appendChild(taskText);
        taskList.appendChild(listItem);
    }
}

function clearCompletedTasks() {
    for (let i = tasks.length - 1; i >= 0; i--) {
        if (tasks[i].completed) {
            tasks.splice(i, 1);
        }
    }
    displayTasks();
    saveTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

const savedTasks = JSON.parse(localStorage.getItem('tasks'));
if (Array.isArray(savedTasks)) {
    tasks.push(...savedTasks);
}

function displayDate() {
    const dateElement = document.getElementById("date");
    const currentDate = new Date();

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('en-US', options);

    dateElement.textContent = formattedDate;
}

displayDate();

