/* ============================================================
 * Task Manager — localStorage
 * Vanilla JS, без залежностей.
 * ============================================================ */

(function () {
    'use strict';

    /* ----- Constants ----- */
    const STORAGE_KEY = 'taskManager.tasks';
    const FILTER_KEY = 'taskManager.filter';

    /* ----- DOM refs ----- */
    const els = {
        form: document.getElementById('taskForm'),
        title: document.getElementById('title'),
        titleError: document.getElementById('titleError'),
        description: document.getElementById('description'),
        deadline: document.getElementById('deadline'),
        resetBtn: document.getElementById('resetBtn'),
        list: document.getElementById('taskList'),
        empty: document.getElementById('emptyState'),
        clearAll: document.getElementById('clearAllBtn'),
        filterBtns: document.querySelectorAll('.filter-btn'),
        statTotal: document.getElementById('statTotal'),
        statActive: document.getElementById('statActive'),
        statDone: document.getElementById('statDone'),
        // modal
        modal: document.getElementById('editModal'),
        editForm: document.getElementById('editForm'),
        editId: document.getElementById('editId'),
        editTitle: document.getElementById('editTitle'),
        editDescription: document.getElementById('editDescription'),
        editDeadline: document.getElementById('editDeadline'),
        closeModal: document.getElementById('closeModal'),
        cancelEdit: document.getElementById('cancelEdit'),
        // toast
        toast: document.getElementById('toast'),
    };

    /* ----- State ----- */
    let tasks = loadTasks();
    let currentFilter = loadFilter();

    /* ============================================================
     * Storage layer
     * ============================================================ */

    function loadTasks() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            console.warn('Не вдалося прочитати localStorage, скидаємо:', err);
            localStorage.removeItem(STORAGE_KEY);
            return [];
        }
    }

    function saveTasks() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch (err) {
            console.error('Помилка запису в localStorage:', err);
            showToast('Не вдалося зберегти дані', 'error');
        }
    }

    function loadFilter() {
        const saved = localStorage.getItem(FILTER_KEY);
        return ['all', 'active', 'done'].includes(saved) ? saved : 'all';
    }

    function saveFilter() {
        localStorage.setItem(FILTER_KEY, currentFilter);
    }

    /* ============================================================
     * ID generator
     * ============================================================ */

    function generateId() {
        if (window.crypto && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    }

    /* ============================================================
     * CRUD
     * ============================================================ */

    function addTask({ title, description, deadline }) {
        const task = {
            id: generateId(),
            title: title.trim(),
            description: (description || '').trim(),
            deadline: deadline || '',
            completed: false,
            createdAt: new Date().toISOString(),
        };
        tasks.unshift(task);
        saveTasks();
        render();
        showToast('Задачу додано');
    }

    function deleteTask(id) {
        const el = els.list.querySelector(`[data-id="${id}"]`);
        if (el) {
            el.classList.add('removing');
            setTimeout(() => {
                tasks = tasks.filter(t => t.id !== id);
                saveTasks();
                render();
                showToast('Задачу видалено');
            }, 220);
        } else {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            render();
        }
    }

    function toggleComplete(id) {
        const t = tasks.find(x => x.id === id);
        if (!t) return;
        t.completed = !t.completed;
        saveTasks();
        render();
    }

    function updateTask(id, updates) {
        const t = tasks.find(x => x.id === id);
        if (!t) return;
        t.title = updates.title.trim();
        t.description = (updates.description || '').trim();
        t.deadline = updates.deadline || '';
        saveTasks();
        render();
        showToast('Зміни збережено');
    }

    function clearAllTasks() {
        if (tasks.length === 0) return;
        const ok = confirm(`Видалити всі ${tasks.length} задач? Цю дію не можна скасувати.`);
        if (!ok) return;
        tasks = [];
        saveTasks();
        render();
        showToast('Усі задачі видалено');
    }

    /* ============================================================
     * Helpers
     * ============================================================ */

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /** Повертає рядок дедлайну + клас стану ('overdue' | 'soon' | 'ok' | ''). */
    function formatDeadline(iso) {
        if (!iso) return { text: '', state: '' };
        const d = new Date(iso);
        if (isNaN(d.getTime())) return { text: '', state: '' };

        const text = d.toLocaleString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        const now = Date.now();
        const diffMs = d.getTime() - now;
        const hours = diffMs / (1000 * 60 * 60);

        let state = 'ok';
        if (diffMs < 0) state = 'overdue';
        else if (hours <= 24) state = 'soon';

        return { text, state };
    }

    function getVisibleTasks() {
        if (currentFilter === 'active') return tasks.filter(t => !t.completed);
        if (currentFilter === 'done') return tasks.filter(t => t.completed);
        return tasks;
    }

    /* ============================================================
     * Render
     * ============================================================ */

    function renderTask(task) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.setAttribute('data-id', task.id);
        if (task.completed) li.classList.add('completed');

        const { text: deadlineText, state: deadlineState } = formatDeadline(task.deadline);
        const deadlineClass =
            deadlineState === 'overdue' ? 'deadline-overdue' :
            deadlineState === 'soon' ? 'deadline-soon' : '';

        const deadlineIcon = task.deadline
            ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
            : '';

        const descriptionHtml = task.description
            ? `<p class="task-description">${escapeHtml(task.description)}</p>`
            : '';

        const deadlineHtml = deadlineText
            ? `<div class="task-deadline ${deadlineClass}">
                    ${deadlineIcon}
                    <span>${deadlineText}${deadlineState === 'overdue' ? ' • прострочено' : deadlineState === 'soon' ? ' • скоро' : ''}</span>
                </div>`
            : '';

        li.innerHTML = `
            <div class="task-row">
                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.completed ? 'checked' : ''}
                    aria-label="Позначити виконаною">

                <div class="task-content">
                    <h3 class="task-title">${escapeHtml(task.title)}</h3>
                    ${descriptionHtml}
                    ${deadlineHtml}
                </div>

                <div class="task-actions">
                    <button
                        class="action-btn edit"
                        data-action="edit"
                        aria-label="Редагувати">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button
                        class="action-btn delete"
                        data-action="delete"
                        aria-label="Видалити">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/></svg>
                    </button>
                </div>
            </div>
        `;
        return li;
    }

    function renderStats() {
        const total = tasks.length;
        const done = tasks.filter(t => t.completed).length;
        const active = total - done;
        els.statTotal.textContent = total;
        els.statActive.textContent = active;
        els.statDone.textContent = done;
    }

    function renderFilters() {
        els.filterBtns.forEach(btn => {
            const isActive = btn.dataset.filter === currentFilter;
            btn.classList.toggle('active', isActive);
        });
    }

    function render() {
        const visible = getVisibleTasks();
        els.list.innerHTML = '';
        visible.forEach(t => els.list.appendChild(renderTask(t)));
        els.empty.classList.toggle('hidden', visible.length > 0);
        renderStats();
        renderFilters();
    }

    /* ============================================================
     * Toast
     * ============================================================ */

    let toastTimer = null;
    function showToast(message, type) {
        if (toastTimer) clearTimeout(toastTimer);
        els.toast.textContent = message;
        els.toast.classList.remove('hidden', 'show');
        // force reflow для перезапуску анімації
        void els.toast.offsetWidth;
        els.toast.classList.add('show');

        if (type === 'error') {
            els.toast.classList.add('error');
        } else {
            els.toast.classList.remove('error');
        }

        toastTimer = setTimeout(() => {
            els.toast.classList.remove('show');
            setTimeout(() => els.toast.classList.add('hidden'), 300);
        }, 1800);
    }

    /* ============================================================
     * Modal
     * ============================================================ */

    function openEditModal(id) {
        const t = tasks.find(x => x.id === id);
        if (!t) return;
        els.editId.value = t.id;
        els.editTitle.value = t.title;
        els.editDescription.value = t.description;
        // datetime-local потребує формат YYYY-MM-DDTHH:MM
        els.editDeadline.value = t.deadline ? t.deadline.slice(0, 16) : '';
        els.modal.classList.remove('hidden');
        els.modal.classList.add('show');
        setTimeout(() => els.editTitle.focus(), 50);
    }

    function closeEditModal() {
        els.modal.classList.remove('show');
        setTimeout(() => els.modal.classList.add('hidden'), 150);
    }

    /* ============================================================
     * Event listeners
     * ============================================================ */

    // Форма додавання
    els.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = els.title.value.trim();
        if (!title) {
            els.titleError.classList.remove('hidden');
            els.title.focus();
            return;
        }
        els.titleError.classList.add('hidden');
        addTask({
            title,
            description: els.description.value,
            deadline: els.deadline.value,
        });
        els.form.reset();
        els.title.focus();
    });

    els.title.addEventListener('input', () => {
        if (els.title.value.trim()) els.titleError.classList.add('hidden');
    });

    // Делегування подій на списку
    els.list.addEventListener('click', (e) => {
        const item = e.target.closest('.task-item');
        if (!item) return;
        const id = item.getAttribute('data-id');


        // Кнопки дій
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn) {
            const action = actionBtn.dataset.action;
            if (action === 'delete') deleteTask(id);
            if (action === 'edit') openEditModal(id);
        }
    });

    // Зміна чекбоксу через зміну значення
    els.list.addEventListener('change', (e) => {
        if (e.target.classList.contains('task-checkbox')) {
            const item = e.target.closest('.task-item');
            if (item) toggleComplete(item.getAttribute('data-id'));
        }
    });

    // Фільтри
    els.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            saveFilter();
            render();
        });
    });

    // Очистити все
    els.clearAll.addEventListener('click', clearAllTasks);

    // Модалка — закриття
    els.closeModal.addEventListener('click', closeEditModal);
    els.cancelEdit.addEventListener('click', closeEditModal);
    els.modal.addEventListener('click', (e) => {
        if (e.target === els.modal) closeEditModal();
    });

    // Модалка — сабміт
    els.editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = els.editId.value;
        const title = els.editTitle.value.trim();
        if (!title) {
            els.editTitle.focus();
            return;
        }
        updateTask(id, {
            title,
            description: els.editDescription.value,
            deadline: els.editDeadline.value,
        });
        closeEditModal();
    });

    // Закриття модалки по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !els.modal.classList.contains('hidden')) {
            closeEditModal();
        }
    });

    /* ============================================================
     * Init
     * ============================================================ */

    render();

    // Консольне привітання
    console.log(
        '%c Task Manager ',
        'background: #4f46e5; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
        'готовий до роботи. Дані зберігаються в localStorage.'
    );
})();
