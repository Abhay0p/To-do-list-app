// public/js/script.js
document.addEventListener('DOMContentLoaded', () => {
    const taskTitleInput = document.getElementById('task-title');
    const taskDescriptionInput = document.getElementById('task-description');
    const addTaskButton = document.getElementById('add-task');
    const tasksContainer = document.getElementById('tasks-container');

    // Load tasks when page loads
    loadTasks();

    // Add task event
    addTaskButton.addEventListener('click', addTask);

    // Allow adding task with Enter key
    taskTitleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    function loadTasks() {
        fetch('/api/tasks')
            .then(response => response.json())
            .then(tasks => {
                tasksContainer.innerHTML = '';
                if (tasks.length === 0) {
                    tasksContainer.innerHTML = '<p class="no-tasks">No tasks yet. Add one above!</p>';
                    return;
                }
                tasks.forEach(task => {
                    addTaskToDOM(task);
                });
            })
            .catch(error => {
                console.error('Error loading tasks:', error);
            });
    }

    function addTask() {
        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();

        if (!title) {
            alert('Please enter a task title');
            return;
        }

        fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description }),
        })
            .then(response => response.json())
            .then(newTask => {
                addTaskToDOM(newTask);
                taskTitleInput.value = '';
                taskDescriptionInput.value = '';
                taskTitleInput.focus();
            })
            .catch(error => {
                console.error('Error adding task:', error);
            });
    }

    function addTaskToDOM(task) {
        const noTasksMessage = document.querySelector('.no-tasks');
        if (noTasksMessage) {
            noTasksMessage.remove();
        }

        const taskElement = document.createElement('div');
        taskElement.className = `task ${task.completed ? 'completed' : ''}`;
        taskElement.dataset.id = task.id;

        taskElement.innerHTML = `
            <div class="task-info">
                <div class="task-title">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    ${task.title}
                </div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            </div>
            <div class="task-actions">
                <button class="edit">Edit</button>
                <button class="delete">Delete</button>
            </div>
        `;

        tasksContainer.prepend(taskElement);

        // Add event listeners for the new task
        const checkbox = taskElement.querySelector('input[type="checkbox"]');
        const editButton = taskElement.querySelector('.edit');
        const deleteButton = taskElement.querySelector('.delete');

        checkbox.addEventListener('change', () => toggleTaskComplete(task.id, checkbox.checked));
        deleteButton.addEventListener('click', () => deleteTask(task.id));
        editButton.addEventListener('click', () => editTask(task));
    }

    function toggleTaskComplete(taskId, isCompleted) {
        fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: isCompleted }),
        })
            .then(response => response.json())
            .then(updatedTask => {
                const taskElement = document.querySelector(`.task[data-id="${taskId}"]`);
                if (updatedTask.completed) {
                    taskElement.classList.add('completed');
                } else {
                    taskElement.classList.remove('completed');
                }
            })
            .catch(error => {
                console.error('Error updating task:', error);
            });
    }

    function deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(() => {
                document.querySelector(`.task[data-id="${taskId}"]`).remove();
                if (document.querySelectorAll('.task').length === 0) {
                    tasksContainer.innerHTML = '<p class="no-tasks">No tasks yet. Add one above!</p>';
                }
            })
            .catch(error => {
                console.error('Error deleting task:', error);
            });
    }

    function editTask(task) {
        const newTitle = prompt('Edit task title:', task.title);
        if (newTitle === null || newTitle.trim() === '') return;

        const newDescription = prompt('Edit task description:', task.description || '');

        fetch(`/api/tasks/${task.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: newTitle,
                description: newDescription,
                completed: task.completed
            }),
        })
            .then(response => response.json())
            .then(updatedTask => {
                loadTasks(); // Refresh the list to show updated task
            })
            .catch(error => {
                console.error('Error updating task:', error);
            });
    }
});
