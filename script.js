let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const toDoApp = document.querySelector(".todo-app");
const addTaskBtn = document.querySelector("#addTask");
const editTaskBtn = document.querySelector("#task-edit");
const taskForm = document.querySelector(".task__form");
const createTaskBtn = document.querySelector("#taskCreate");
const taskInput = document.querySelector(".task__form input");
const taskDescription = document.querySelector("#taskDescription");
const taskList = document.querySelector(".task__list");

const saveToLocalStorage = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
};

const loadFromLocalStorage = () => {
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
};

const updateProgressBar = () => {
    const totalTasks = tasks.length;
    const completeTasks = tasks.filter((t) => t.complete).length;
    const progresBarPrecentage = totalTasks
        ? (completeTasks / totalTasks) * 100
        : 0;
    const progressBar = document.querySelector(".progress-bar");
    const taskCount = document.querySelector(".task__count");

    progressBar.style.setProperty(
        "--progress-width",
        progresBarPrecentage + "%"
    );

    taskCount.innerHTML = `
        <span>${completeTasks}/${totalTasks}</span> 
        tasks
    `;
};

renderTasks();

const createTask = () => {
    const title = taskInput.value;
    const description = taskDescription.value;

    if (!title) return;

    const task = {
        id: Date.now(),
        title,
        description,
        complete: false,
    };

    tasks.unshift(task);

    toggleTaskForm();
    saveToLocalStorage();
    renderTasks();
};

function renderTasks() {
    taskList.innerHTML = tasks
        .map(
            (task) =>
                `
        <div class="task" data-task-id="${task.id}">
            <div class="task__item">
                <input
                    id="task-${task.id}"
                    type="checkbox"
                    class="task__checkbox"
                    data-action="toggleTask"
                    ${task.complete ? "checked" : ""}
                />
                <label for="task-${task.id}" class="task__label">
                    <h3 class="task__title">${task.title}</h3>
                    <p class="task__description">${task.description}</p>
                </label>
            </div>

            <div class="task__actions">
                <button data-action="editTask" class="task__button task__button--edit">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button data-action="deleteTask" class="task__button task__button--delete">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
    `
        )
        .join("");

    updateProgressBar();
}

// DONE
const createOverlayElement = () => {
    const overlay = document.createElement("div");
    overlay.classList.add("todo-app-overlay");
    return overlay;
};

const addOverlay = () => {
    const overlayElement = createOverlayElement();
    toDoApp.appendChild(overlayElement);
};

const removeOverlay = () => {
    const overlayElement = document.querySelector(".todo-app-overlay");
    overlayElement ? overlayElement.remove() : null;
};

const toggleTaskForm = () => {
    const isVisible = taskForm.classList.toggle("visible");

    if (isVisible) {
        addOverlay();
        taskInput.value = "";
        taskDescription.value = "";
    } else {
        removeOverlay();
    }
};

const editTask = (task) => {
    const isVisible = taskForm.classList.toggle("visible");

    taskForm.setAttribute("data-task-edit", "true");
    taskForm.setAttribute("data-task-id", task.id);

    if (isVisible) {
        addOverlay();
        taskInput.value = task.title;
        taskDescription.value = task.description;
    } else {
        removeOverlay();
        taskForm.removeAttribute("data-task-edit");
    }
};

const updateTask = (id) => {
    const task = tasks.find((t) => t.id === Number(id));
    if (!task) return;

    const taskElement = document.querySelector(
        `.task__form[data-task-id='${id}']`
    );
    if (!taskElement) return;

    Object.assign(task, {
        title: taskElement.querySelector("input").value,
        description: taskElement.querySelector("textarea").value,
    });

    const isVisible = taskForm.classList.toggle("visible");

    saveToLocalStorage();
    renderTasks();

    isVisible ? addOverlay() : removeOverlay();
    if (!isVisible) taskForm.removeAttribute("data-task-edit");
};

const toogleTask = (id) => {
    const task = tasks.find((t) => t.id === Number(id));

    if (!task) return;
    task.complete = !task.complete;

    saveToLocalStorage();
    renderTasks();
};

const deleteTask = (id) => {
    const newTasks = tasks.filter((t) => t.id !== Number(id));
    tasks = newTasks;

    saveToLocalStorage();
    renderTasks();
};

document.addEventListener("keydown", (e) => {
    if (!taskForm.classList.contains("visible")) return;

    const isEditMode = taskForm.getAttribute("data-task-edit") === "true";

    if (e.key === "Enter") {
        if (isEditMode) {
            const taskElement = document.querySelector(
                ".task__form[data-task-edit='true']"
            );
            if (!taskElement) return;

            const task = {
                title: taskElement.querySelector("input").value,
                description:
                    taskElement.querySelector("#taskDescription").value,
                id: taskElement.getAttribute("data-task-id"),
            };

            updateTask(task.id);
        } else {
            createTask();
        }

        removeOverlay();
    }

    if (e.key === "Escape") {
        taskForm.classList.toggle("visible");
        removeOverlay();
    }
});

document.addEventListener("click", (e) => {
    const target = e.target;
    const action = e.target.closest("[data-action]")?.dataset.action;

    if (!action) return;

    switch (action) {
        case "addTask":
            toggleTaskForm();
            break;
        case "createTask":
            createTask();
            removeOverlay();
            break;
        case "updateTask":
            const taskElement = target.closest(".task__form");

            if (taskElement) {
                const task = {
                    title: taskElement.querySelector("input").value,
                    description:
                        taskElement.querySelector("#task-description").value,
                    id: taskElement.getAttribute("data-task-id"),
                };

                updateTask(task.id);
                removeOverlay();
            }
            break;
        case "editTask":
            const taskContainer = target.closest(".task");

            const task = {
                title: taskContainer.querySelector(".task__title").textContent,
                description:
                    taskContainer.querySelector(".task__description")
                        .textContent,
                id: taskContainer.getAttribute("data-task-id"),
            };

            editTask(task);
            break;
        case "cancelTask":
            taskForm.classList.toggle("visible");
            removeOverlay();
            break;
        case "toggleTask":
            const taskId = target.closest(".task").getAttribute("data-task-id");

            toogleTask(taskId);
            break;
        case "deleteTask":
            const deleteTaskId = target
                .closest(".task")
                .getAttribute("data-task-id");

            deleteTask(deleteTaskId);
            break;
        default:
            break;
    }
});
