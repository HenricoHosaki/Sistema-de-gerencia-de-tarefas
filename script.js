// Simulação de banco de dados (localStorage)
let users = JSON.parse(localStorage.getItem('users')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Verifica se já existe um usuário padrão no sistema
if (users.length === 0) {
    // Cria um usuário padrão
    users.push({
        id: 1,
        name: 'Usuário Demo',
        email: 'demo@email.com',
        password: 'demo123'
    });
    
    // Cria algumas tarefas de exemplo
    tasks = [
        {
            id: 1,
            userId: 1,
            title: 'Preparar relatório mensal',
            description: 'Finalizar o relatório de vendas do mês anterior',
            priority: 'alta',
            status: 'em_progresso',
            dueDate: '2025-02-28',
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            userId: 1,
            title: 'Reunião com clientes',
            description: 'Apresentar novos produtos para os clientes',
            priority: 'media',
            status: 'concluida',
            dueDate: '2025-02-25',
            completedAt: '2025-02-25',
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            userId: 1,
            title: 'Desenvolver protótipo',
            description: 'Criar o protótipo da nova funcionalidade',
            priority: 'baixa',
            status: 'pendente',
            dueDate: '2025-03-10',
            createdAt: new Date().toISOString()
        }
    ];
    
    // Salva no localStorage
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Elementos DOM - Login e Cadastro
const loginPage = document.getElementById('login-page');
const dashboardPage = document.getElementById('dashboard-page');
const loginForm = document.getElementById('login-form');
const forgotPasswordLink = document.getElementById('forgot-password');
const createAccountLink = document.getElementById('create-account');
const forgotPasswordModal = document.getElementById('forgot-password-modal');
const createAccountModal = document.getElementById('create-account-modal');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const createAccountForm = document.getElementById('create-account-form');

// Elementos DOM - Dashboard
const logoutBtn = document.getElementById('logout-btn');
const username = document.getElementById('username');
const navLinks = document.querySelectorAll('.nav-link');
const homeTabs = document.querySelectorAll('.tab');
const addTaskBtns = document.querySelectorAll('[id^="add-task-btn"]');

// Elementos DOM - Tabelas de tarefas
const recentTasksTable = document.getElementById('recent-tasks');
const allTasksTable = document.getElementById('all-tasks-list');
const pendingTasksTable = document.getElementById('pending-tasks-list');
const completedTasksTable = document.getElementById('completed-tasks-list');

// Elementos DOM - Modais de tarefa
const taskModal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const taskModalTitle = document.getElementById('task-modal-title');
const taskIdInput = document.getElementById('task-id');
const taskTitleInput = document.getElementById('task-title');
const taskDescriptionInput = document.getElementById('task-description');
const taskPriorityInput = document.getElementById('task-priority');
const taskStatusInput = document.getElementById('task-status');
const taskDueDateInput = document.getElementById('task-due-date');

// Elementos DOM - Modal de exclusão
const deleteModal = document.getElementById('delete-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete');
let taskToDelete = null;

// Verifica se o usuário está logado
function checkLogin() {
    if (currentUser) {
        // Atualiza o nome do usuário
        username.textContent = currentUser.name;
        
        // Mostra o dashboard e esconde a página de login
        loginPage.style.display = 'none';
        dashboardPage.style.display = 'block';
        
        // Carrega os dados do usuário
        loadUserData();
    } else {
        // Mostra a página de login e esconde o dashboard
        loginPage.style.display = 'flex';
        dashboardPage.style.display = 'none';
    }
}

// Carrega os dados do usuário logado
function loadUserData() {
    // Obtém as tarefas do usuário atual
    const userTasks = tasks.filter(task => task.userId === currentUser.id);
    
    // Conta o número de tarefas por status
    const totalTasks = userTasks.length;
    const pendingTasks = userTasks.filter(task => task.status !== 'concluida').length;
    const completedTasks = userTasks.filter(task => task.status === 'concluida').length;
    
    // Atualiza os números no dashboard
    document.querySelectorAll('.number')[0].textContent = totalTasks;
    document.querySelectorAll('.number')[1].textContent = pendingTasks;
    document.querySelectorAll('.number')[2].textContent = completedTasks;
    
    // Carrega as tarefas recentes
    loadRecentTasks();
    
    // Carrega todas as tarefas
    loadAllTasks();
    
    // Carrega as tarefas pendentes
    loadPendingTasks();
    
    // Carrega as tarefas concluídas
    loadCompletedTasks();
}

// Carrega as tarefas recentes
function loadRecentTasks() {
    const userTasks = tasks.filter(task => task.userId === currentUser.id);
    const recentTasks = [...userTasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    
    // Limpa a tabela
    recentTasksTable.innerHTML = '';
    
    // Adiciona as tarefas na tabela
    recentTasks.forEach(task => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.title}</td>
            <td><span class="badge badge-${getPriorityClass(task.priority)}">${getPriorityLabel(task.priority)}</span></td>
            <td><span class="badge badge-${getStatusClass(task.status)}">${getStatusLabel(task.status)}</span></td>
            <td>${formatDate(task.dueDate)}</td>
            <td class="task-actions">
                <button class="action-btn edit-task" data-id="${task.id}">Editar</button>
                <button class="action-btn delete-task" data-id="${task.id}">Excluir</button>
            </td>
        `;
        recentTasksTable.appendChild(row);
    });
    
    // Se não houver tarefas, exibe uma mensagem
    if (recentTasks.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" style="text-align: center;">Nenhuma tarefa encontrada</td>';
        recentTasksTable.appendChild(row);
    }
    
    // Adiciona os eventos de editar e excluir
    addTaskEvents();
}

// Carrega todas as tarefas
function loadAllTasks() {
    const userTasks = tasks.filter(task => task.userId === currentUser.id);
    
    // Limpa a tabela
    allTasksTable.innerHTML = '';
    
    // Adiciona as tarefas na tabela
    userTasks.forEach(task => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.title}</td>
            <td>${task.description || '-'}</td>
            <td><span class="badge badge-${getPriorityClass(task.priority)}">${getPriorityLabel(task.priority)}</span></td>
            <td><span class="badge badge-${getStatusClass(task.status)}">${getStatusLabel(task.status)}</span></td>
            <td>${formatDate(task.dueDate)}</td>
            <td class="task-actions">
                <button class="action-btn edit-task" data-id="${task.id}">Editar</button>
                <button class="action-btn delete-task" data-id="${task.id}">Excluir</button>
            </td>
        `;
        allTasksTable.appendChild(row);
    });
    
    // Se não houver tarefas, exibe uma mensagem
    if (userTasks.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align: center;">Nenhuma tarefa encontrada</td>';
        allTasksTable.appendChild(row);
    }
    
    // Adiciona os eventos de editar e excluir
    addTaskEvents();
}

// Completa a função de carregar as tarefas pendentes
function loadPendingTasks() {
    const pendingTasks = tasks.filter(task => task.userId === currentUser.id && task.status !== 'concluida');
    
    // Limpa a tabela
    pendingTasksTable.innerHTML = '';
    
    // Adiciona as tarefas na tabela
    pendingTasks.forEach(task => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.title}</td>
            <td>${task.description || '-'}</td>
            <td><span class="badge badge-${getPriorityClass(task.priority)}">${getPriorityLabel(task.priority)}</span></td>
            <td><span class="badge badge-${getStatusClass(task.status)}">${getStatusLabel(task.status)}</span></td>
            <td>${formatDate(task.dueDate)}</td>
            <td class="task-actions">
                <button class="action-btn edit-task" data-id="${task.id}">Editar</button>
                <button class="action-btn delete-task" data-id="${task.id}">Excluir</button>
            </td>
        `;
        pendingTasksTable.appendChild(row);
    });
    
    // Se não houver tarefas, exibe uma mensagem
    if (pendingTasks.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align: center;">Nenhuma tarefa pendente encontrada</td>';
        pendingTasksTable.appendChild(row);
    }
    
    // Adiciona os eventos de editar e excluir
    addTaskEvents();
}

// Adiciona eventos para edição e exclusão de tarefas
function addTaskEvents() {
    document.querySelectorAll('.edit-task').forEach(button => {
        button.addEventListener('click', () => {
            const taskId = parseInt(button.dataset.id);
            openTaskModal(taskId);
        });
    });
    
    document.querySelectorAll('.delete-task').forEach(button => {
        button.addEventListener('click', () => {
            const taskId = parseInt(button.dataset.id);
            openDeleteModal(taskId);
        });
    });
}

// Abre o modal para editar uma tarefa
function openTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        taskIdInput.value = task.id;
        taskTitleInput.value = task.title;
        taskDescriptionInput.value = task.description;
        taskPriorityInput.value = task.priority;
        taskStatusInput.value = task.status;
        taskDueDateInput.value = task.dueDate;
        
        taskModal.style.display = 'block';
    }
}

// Fecha o modal de edição
function closeTaskModal() {
    taskModal.style.display = 'none';
}

taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const taskId = parseInt(taskIdInput.value);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex > -1) {
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            title: taskTitleInput.value,
            description: taskDescriptionInput.value,
            priority: taskPriorityInput.value,
            status: taskStatusInput.value,
            dueDate: taskDueDateInput.value,
        };
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadUserData();
        closeTaskModal();
    }
});

// Abre o modal de confirmação para excluir uma tarefa
function openDeleteModal(taskId) {
    taskToDelete = taskId;
    deleteModal.style.display = 'block';
}

// Cancela a exclusão de uma tarefa
cancelDeleteBtn.addEventListener('click', () => {
    taskToDelete = null;
    deleteModal.style.display = 'none';
});

// Confirma e exclui a tarefa
confirmDeleteBtn.addEventListener('click', () => {
    if (taskToDelete !== null) {
        tasks = tasks.filter(task => task.id !== taskToDelete);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadUserData();
    }
    deleteModal.style.display = 'none';
});

// Inicializa o sistema verificando o login
checkLogin();