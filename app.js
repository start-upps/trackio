// Define an array to store tasks
const tasks = [];

// Function to add a new task
function addTask() {
    const taskInput = document.getElementById("taskInput");
    const taskText = taskInput.value.trim();

    if (taskText !== "") {
        tasks.push({ text: taskText, completed: false });
        displayTasks();
        taskInput.value = "";
    }
}

// Function to display tasks
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
        });

        const taskText = document.createElement("span");
        taskText.innerText = task.text;

        listItem.appendChild(checkbox);
        listItem.appendChild(taskText);
        taskList.appendChild(listItem);
    }
}

// Function to clear completed tasks
function clearCompletedTasks() {
    for (let i = tasks.length - 1; i >= 0; i--) {
        if (tasks[i].completed) {
            tasks.splice(i, 1);
        }
    }
    displayTasks();
}

// Initial task display
displayTasks();
