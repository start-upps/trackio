// Define an array to store tasks
const tasks = [];

// Function to add a new task
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
            saveTasks();
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
    saveTasks();
}

// Function to save tasks to local storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Initialize tasks array by retrieving data from local storage
const savedTasks = JSON.parse(localStorage.getItem('tasks'));
if (Array.isArray(savedTasks)) {
    tasks.push(...savedTasks);
}

// Function to display the current date
function displayDate() {
    const dateElement = document.getElementById("date");
    const currentDate = new Date();

    // Format the date as "Day, Month Date, Year"
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('en-US', options);

    dateElement.textContent = formattedDate;
}

// Initialize the date with the custom color when the page loads
displayDate();

