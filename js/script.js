// Modern To-Do List Application

class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTodos();
        this.setMinDate();
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('todoForm');
        form.addEventListener('submit', (e) => this.handleAddTodo(e));

        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });

        // Delete all button
        const deleteAllBtn = document.getElementById('deleteAllBtn');
        deleteAllBtn.addEventListener('click', () => this.handleDeleteAll());
    }

    setMinDate() {
        const dateInput = document.getElementById('dateInput');
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    handleAddTodo(e) {
        e.preventDefault();

        const todoInput = document.getElementById('todoInput');
        const dateInput = document.getElementById('dateInput');

        // Validation
        if (!this.validateForm(todoInput.value, dateInput.value)) {
            return;
        }

        const newTodo = {
            id: Date.now(),
            text: todoInput.value.trim(),
            date: dateInput.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(newTodo);
        this.saveTodos();
        this.renderTodos();

        // Reset form
        todoInput.value = '';
        dateInput.value = '';
        
        // Show success feedback
        this.showNotification('Task added successfully! 🎉', 'success');
    }

    validateForm(text, date) {
        if (!text.trim()) {
            this.showNotification('Please enter a task description', 'error');
            return false;
        }

        if (text.trim().length < 3) {
            this.showNotification('Task description must be at least 3 characters', 'error');
            return false;
        }

        if (!date) {
            this.showNotification('Please select a due date', 'error');
            return false;
        }

        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            this.showNotification('Due date cannot be in the past', 'error');
            return false;
        }

        return true;
    }

    handleFilter(e) {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => btn.classList.remove('active'));
        
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.renderTodos();
    }

    handleToggleComplete(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
            
            const message = todo.completed 
                ? 'Task completed! Great job! ✅' 
                : 'Task marked as pending';
            this.showNotification(message, 'success');
        }
    }

    handleDeleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.renderTodos();
            this.showNotification('Task deleted successfully', 'success');
        }
    }

    handleDeleteAll() {
        if (this.todos.length === 0) {
            this.showNotification('No tasks to delete', 'error');
            return;
        }

        if (confirm('Are you sure you want to delete ALL tasks? This action cannot be undone.')) {
            this.todos = [];
            this.saveTodos();
            this.renderTodos();
            this.showNotification('All tasks deleted', 'success');
        }
    }

    getFilteredTodos() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (this.currentFilter) {
            case 'today':
                return this.todos.filter(todo => {
                    const todoDate = new Date(todo.date);
                    todoDate.setHours(0, 0, 0, 0);
                    return todoDate.getTime() === today.getTime();
                });
            
            case 'upcoming':
                return this.todos.filter(todo => {
                    const todoDate = new Date(todo.date);
                    todoDate.setHours(0, 0, 0, 0);
                    return todoDate > today && !todo.completed;
                });
            
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            
            default:
                return this.todos;
        }
    }

    renderTodos() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p>No tasks found</p>
                    <small>${this.getEmptyMessage()}</small>
                </div>
            `;
            return;
        }

        todoList.innerHTML = filteredTodos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <div class="task-text ${todo.completed ? 'completed' : ''}">
                    ${this.escapeHtml(todo.text)}
                </div>
                <div class="task-date">
                    ${this.formatDate(todo.date)}
                </div>
                <div class="task-status">
                    <span class="status-badge ${todo.completed ? 'completed' : 'pending'}">
                        ${todo.completed ? 'Completed' : 'Pending'}
                    </span>
                </div>
                <div class="task-actions">
                    <button class="btn-action btn-complete" onclick="todoApp.handleToggleComplete(${todo.id})">
                        ${todo.completed ? '↩️ Undo' : '✓ Done'}
                    </button>
                    <button class="btn-action btn-delete" onclick="todoApp.handleDeleteTodo(${todo.id})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    getEmptyMessage() {
        switch (this.currentFilter) {
            case 'today':
                return 'No tasks scheduled for today';
            case 'upcoming':
                return 'No upcoming tasks';
            case 'completed':
                return 'No completed tasks yet';
            default:
                return 'Add your first task to get started!';
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todoDate = new Date(date);
        todoDate.setHours(0, 0, 0, 0);

        if (todoDate.getTime() === today.getTime()) {
            return 'Today';
        } else if (todoDate.getTime() === tomorrow.getTime()) {
            return 'Tomorrow';
        } else {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.875rem',
            zIndex: '1000',
            animation: 'slideInRight 0.3s ease',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            maxWidth: '300px'
        });

        notification.style.background = type === 'success' 
            ? 'linear-gradient(135deg, #2DD4BF, #14B8A6)' 
            : 'linear-gradient(135deg, #EF4444, #DC2626)';

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    saveTodos() {
        const todos = this.todos || [];
        const todosData = { todos, lastUpdated: new Date().toISOString() };
        
        // Store in memory (since localStorage is not available)
        window.todosData = todosData;
    }

    loadTodos() {
        // Load from memory
        if (window.todosData && window.todosData.todos) {
            return window.todosData.todos;
        }
        return [];
    }
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize app
const todoApp = new TodoApp();