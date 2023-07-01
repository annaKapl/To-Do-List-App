class TodoList {
  constructor() {
    this.tasks = [];
    this.nextTaskId = 1;
    this.timer = null;

    document.addEventListener('DOMContentLoaded', () => {
      const todoList = new TodoList();

      this.renderTasks();
      this.startTimer();
    });
  }
  startTimer() {
    this.timer = setInterval(() => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-UA', {
        hour12: false,
        hour: 'numeric',
        minute: 'numeric',
      });
      document.getElementById('currentTime').innerText = currentTime;
    }, 1000);
  }
  stopTimer() {
    clearInterval(this.timer);
    const currentTimeElement = document.getElementById('currentTime');
    currentTimeElement.innerText = '';
  }
  addTask(title, date, time, repetitionType, repetitionEndDate, description) {
    const task = {
      id: this.nextTaskId++,
      title,
      date,
      time,
      repetitionType,
      repetitionEndDate,
      description,
      completed: false,
    };

    this.tasks.push(task);
    this.sortTasks();
    this.renderTasks();

    this.clearInputFields();
    this.showNotification('Task added successfully!');

    if (repetitionType !== 'none') {
      this.scheduleRepetitions(task);
    }

    if (time) {
      const taskDateTime = new Date(`${date}T${time}`);
      const currentTime = new Date();

      if (taskDateTime > currentTime) {
        const timeDifference = taskDateTime - currentTime;

        setTimeout(() => {
          this.completeTask(task.id);
        }, timeDifference);
      }
    }
  }
  deleteTask(taskId) {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
    this.renderTasks();
  }
  editTask(taskId, newTitle, newDate, newTime, newDescription) {
    const task = this.tasks.find((task) => task.id === taskId);
    if (task) {
      task.title = newTitle;
      task.date = newDate;
      task.time = newTime;
      task.description = newDescription;

      this.sortTasks();
      this.renderTasks();
    }
  }
  completeTask(taskId) {
    const taskIndex = this.tasks.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1) {
      const completedTask = this.tasks[taskIndex];
      completedTask.completed = true;
      this.showNotification(`Task "${completedTask.title}" completed!`);
      this.tasks.splice(taskIndex, 1); 
      this.renderTasks(); 
    }
  }
  renderTasks() {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;

    taskList.innerHTML = "";

    this.tasks.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.classList.add("task");

      const titleElement = document.createElement("h3");
      titleElement.classList.add("task-title");
      titleElement.innerText = task.title;

      const infoElement = document.createElement("p");
      infoElement.classList.add("task-info");
      infoElement.innerText = `Date: ${task.date}, Time: ${task.time}`;

      const descriptionElement = document.createElement("p");
      descriptionElement.innerText = task.description;

      const editButton = document.createElement("button");
      editButton.innerText = "Edit";
      editButton.addEventListener("click", () => {
        const newTitle = prompt("Input new title:", task.title);
        const newDate = prompt("Input new date :", task.date);
        const newTime = prompt("Input new  time :", task.time);
        const newDescription = prompt("Input new description :", task.description);
        this.editTask(task.id, newTitle, newDate, newTime, newDescription);
      });

      const deleteButton = document.createElement("button");
      deleteButton.innerText = "Delete";
      deleteButton.addEventListener("click", () => {
        this.deleteTask(task.id);
      });

      const completeButton = document.createElement("button");
      completeButton.innerText = "Complete";
      completeButton.addEventListener("click", () => {
        this.completeTask(task.id);
      });

      taskElement.appendChild(titleElement);
      taskElement.appendChild(infoElement);
      taskElement.appendChild(descriptionElement);
      taskElement.appendChild(editButton);
      taskElement.appendChild(deleteButton);
      taskElement.appendChild(completeButton);

      taskList.appendChild(taskElement);
    });
  }
  sortTasks() {
    this.tasks.sort((taskA, taskB) => {
      const dateA = new Date(`${taskA.date}T${taskA.time}`);
      const dateB = new Date(`${taskB.date}T${taskB.time}`);
      return dateA - dateB;
    });
  }
  clearInputFields() {
    const titleInput = document.getElementById('titleInput');
    const dateInput = document.getElementById('dateInput');
    const timeInput = document.getElementById('timeInput');
    const repetitionTypeInput = document.getElementById('repetitionTypeInput');
    const repetitionEndDateInput = document.getElementById('repetitionEndDateInput');
    const descriptionInput = document.getElementById('descriptionInput');

    if (titleInput) {
      titleInput.value = '';
    }
    if (dateInput) {
      dateInput.value = '';
    }
    if (timeInput) {
      timeInput.value = '';
    }
    if (repetitionTypeInput) {
      repetitionTypeInput.value = '';
    }
    if (repetitionEndDateInput) {
      repetitionEndDateInput.value = '';
    }
    if (descriptionInput) {
      descriptionInput.value = '';
    }
  }
  scheduleRepetitions(task) {
    const { repetitionType, repetitionEndDate } = task;

    if (repetitionType === 'daily') {
      const endDate = new Date(repetitionEndDate);
      let currentDate = new Date(`${task.date}T${task.time}`);

      while (currentDate <= endDate) {
        currentDate.setDate(currentDate.getDate() + 1);
        const repeatedTask = {
          ...task,
          id: this.nextTaskId++,
          date: currentDate.toISOString().split('T')[0],
        };
        this.tasks.push(repeatedTask);
        currentDate = new Date(`${repeatedTask.date}T${repeatedTask.time}`);
      }
    } else if (repetitionType === 'weekly') {
      const endDate = new Date(repetitionEndDate);
      const selectedWeekday = new Date(`${task.date}T${task.time}`).getDay();

      let currentDate = new Date(`${task.date}T${task.time}`);

      while (currentDate <= endDate) {
        currentDate.setDate(currentDate.getDate() + 1);

        if (currentDate.getDay() === selectedWeekday) {
          const repeatedTask = {
            ...task,
            id: this.nextTaskId++,
            date: currentDate.toISOString().split('T')[0],
          };
          this.tasks.push(repeatedTask);
        }
      }
    } else if (repetitionType === 'weekdays') {
      const endDate = new Date(repetitionEndDate);
      let currentDate = new Date(`${task.date}T${task.time}`);

      while (currentDate <= endDate) {
        currentDate.setDate(currentDate.getDate() + 1);

        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          const repeatedTask = {
            ...task,
            id: this.nextTaskId++,
            date: currentDate.toISOString().split('T')[0],
          };
          this.tasks.push(repeatedTask);
        }
      }
    } else if (repetitionType === 'weekends') {
      const endDate = new Date(repetitionEndDate);
      let currentDate = new Date(`${task.date}T${task.time}`);

      while (currentDate <= endDate) {
        currentDate.setDate(currentDate.getDate() + 1);

        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          const repeatedTask = {
            ...task,
            id: this.nextTaskId++,
            date: currentDate.toISOString().split('T')[0],
          };
          this.tasks.push(repeatedTask);
        }
      }
    } else if (repetitionType === 'every-2-weeks') {
      const endDate = new Date(repetitionEndDate);
      let currentDate = new Date(`${task.date}T${task.time}`);

      while (currentDate <= endDate) {
        currentDate.setDate(currentDate.getDate() + 14);
        const repeatedTask = {
          ...task,
          id: this.nextTaskId++,
          date: currentDate.toISOString().split('T')[0],
        };
        this.tasks.push(repeatedTask);
      }
    } else if (repetitionType === 'every-3-months') {
      const endDate = new Date(repetitionEndDate);
      let currentDate = new Date(`${task.date}T${task.time}`);

      while (currentDate <= endDate) {
        currentDate.setMonth(currentDate.getMonth() + 3);
        const repeatedTask = {
          ...task,
          id: this.nextTaskId++,
          date: currentDate.toISOString().split('T')[0],
        };
        this.tasks.push(repeatedTask);
      }
    } else if (repetitionType === 'monthly') {
      const endDate = new Date(repetitionEndDate);
      let currentDate = new Date(`${task.date}T${task.time}`);

      while (currentDate <= endDate) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        const repeatedTask = {
          ...task,
          id: this.nextTaskId++,
          date: currentDate.toISOString().split('T')[0],
        };
        this.tasks.push(repeatedTask);
      }
    } else if (repetitionType === 'yearly') {
      const endDate = new Date(repetitionEndDate);
      let currentDate = new Date(`${task.date}T${task.time}`);

      while (currentDate <= endDate) {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        const repeatedTask = {
          ...task,
          id: this.nextTaskId++,
          date: currentDate.toISOString().split('T')[0],
        };
        this.tasks.push(repeatedTask);
      }
    }

    this.sortTasks();
    this.renderTasks();
  }
  showNotification(message) {
    const modalElement = document.createElement('div');
    modalElement.classList.add('modal');

    const contentElement = document.createElement('div');
    contentElement.classList.add('modal-content');

    const notificationElement = document.createElement('h3');
    notificationElement.textContent = message;

    const closeIconElement = document.createElement('span');
    closeIconElement.classList.add('modal-close');
    closeIconElement.textContent = 'X';
    closeIconElement.addEventListener('click', () => {
      modalElement.remove();
    });

    contentElement.appendChild(notificationElement);
    contentElement.appendChild(closeIconElement);
    modalElement.appendChild(contentElement);
    document.body.appendChild(modalElement);
  }
  
}


module.exports = TodoList;

