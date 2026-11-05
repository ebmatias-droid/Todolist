import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

let currentFilter = 'all';
let todos = [];

const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const itemCount = document.getElementById('itemCount');
const clearCompletedBtn = document.getElementById('clearCompleted');

async function loadTodos() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading todos:', error);
    return;
  }

  todos = data || [];
  renderTodos();
}

function renderTodos() {
  const filteredTodos = getFilteredTodos();

  if (filteredTodos.length === 0) {
    todoList.innerHTML = '<div class="empty-state">No tasks yet. Add one above!</div>';
  } else {
    todoList.innerHTML = filteredTodos
      .map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
          <input
            type="checkbox"
            class="todo-checkbox"
            ${todo.completed ? 'checked' : ''}
          >
          <span class="todo-text">${escapeHtml(todo.task)}</span>
          <button class="delete-btn">Delete</button>
        </li>
      `)
      .join('');
  }

  updateStats();
}

function getFilteredTodos() {
  switch (currentFilter) {
    case 'active':
      return todos.filter(todo => !todo.completed);
    case 'completed':
      return todos.filter(todo => todo.completed);
    default:
      return todos;
  }
}

function updateStats() {
  const activeCount = todos.filter(todo => !todo.completed).length;
  itemCount.textContent = `${activeCount} ${activeCount === 1 ? 'item' : 'items'} left`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function addTodo() {
  const task = todoInput.value.trim();

  if (!task) return;

  const { data, error } = await supabase
    .from('todos')
    .insert([{ task, completed: false }])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error adding todo:', error);
    return;
  }

  if (data) {
    todos.unshift(data);
    renderTodos();
    todoInput.value = '';
  }
}

async function toggleTodo(id, completed) {
  const { error } = await supabase
    .from('todos')
    .update({ completed })
    .eq('id', id);

  if (error) {
    console.error('Error updating todo:', error);
    return;
  }

  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = completed;
    renderTodos();
  }
}

async function deleteTodo(id) {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting todo:', error);
    return;
  }

  todos = todos.filter(t => t.id !== id);
  renderTodos();
}

async function clearCompleted() {
  const completedIds = todos.filter(t => t.completed).map(t => t.id);

  if (completedIds.length === 0) return;

  const { error } = await supabase
    .from('todos')
    .delete()
    .in('id', completedIds);

  if (error) {
    console.error('Error clearing completed:', error);
    return;
  }

  todos = todos.filter(t => !t.completed);
  renderTodos();
}

addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTodo();
  }
});

todoList.addEventListener('click', (e) => {
  const todoItem = e.target.closest('.todo-item');
  if (!todoItem) return;

  const id = todoItem.dataset.id;

  if (e.target.classList.contains('todo-checkbox')) {
    toggleTodo(id, e.target.checked);
  } else if (e.target.classList.contains('delete-btn')) {
    deleteTodo(id);
  }
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

clearCompletedBtn.addEventListener('click', clearCompleted);

loadTodos();
