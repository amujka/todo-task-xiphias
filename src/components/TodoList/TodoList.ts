import { Task, TaskOrigin } from '../../assets/types';

export class TodoList extends HTMLElement {
	#todos: Task[] = [];
	#errors = {
		taskInput: '',
		limitInput: '',
	};
	#completedTasks: number = 0;
	#userId: number = Math.floor(Math.random() * 100);

	constructor() {
		super();
		this.render();
	}

	connectedCallback() {
		this?.addEventListener('delete-task', (e) => {
			const target = e.target as HTMLElement;
			this.removeTaskById(+target.id);
		});
		this?.addEventListener('toggle-complete-task', (e) => {
			const target = e.target as HTMLElement;
			this.toggleCompleteTask(target);
		});
	}

	get template() {
		return `
		<div class="todo">
			<div class="todo__form">
				<div class="todo__input_container">
					<label>New task</label>
					<input type="text" class="todo__new_task_input" placeholder="Add a new item" />
					${
						this.#errors.taskInput
							? `<small class="todo__error">${
									this.#errors.taskInput
							  }</small>`
							: ''
					}
					<button class="todo__add_task_btn">Add task</button>
				</div>
				<div class="todo__input_container">
					<label>Number of tasks</label>
					<input type="number"  class="todo__task_limit_input"/>
					${
						this.#errors.limitInput
							? `<small class="todo__error">${
									this.#errors.limitInput
							  }</small>`
							: ''
					}
					<button class="todo__fetch_tasks_btn">Fetch tasks</button>
				</div>
				<div class="todo__delete_btns_container">
					<button class="todo__delete_all_btn">Delete all tasks</button>
					<button class="todo__delete_fetched_btn">Delete fetched tasks</button>
					<button class="todo__delete_added_btn">Delete added tasks</button>
				</div>
				<p>Completed tasks: ${this.#completedTasks}</p>
			</div>
			${
				this.#todos.length
					? `<div class="todo__list">
				${this.#todos
					.map((task: Task) => {
						return `
						<todo-task
						id="${task.id}"
						todo="${task.todo}"
						completed="${task.completed}"
						>
						</todo-task>`;
					})
					.join('\n')}
				</div>`
					: '<p class="todo__no_tasks_msg">No tasks added yet</p>'
			}
		</div>
    `;
	}

	render() {
		this.#completedTasks = this.#todos.filter((task) => task.completed).length;
		this.innerHTML = `${this.template}`;
		this.querySelector('.todo__add_task_btn')?.addEventListener('click', () =>
			this.addTodoTask()
		);

		this.querySelector('.todo__fetch_tasks_btn')?.addEventListener('click', () =>
			this.fetchTodoTaks()
		);

		this.querySelector('.todo__delete_all_btn')?.addEventListener('click', () =>
			this.deleteAllTasks()
		);
		this.querySelector('.todo__delete_fetched_btn')?.addEventListener('click', () =>
			this.deleteTasksByOrigin(TaskOrigin.FETCHED)
		);
		this.querySelector('.todo__delete_added_btn')?.addEventListener('click', () =>
			this.deleteTasksByOrigin(TaskOrigin.MANUAL)
		);
	}

	addTodoTask() {
		const input = this.querySelector('.todo__new_task_input') as HTMLInputElement;
		if (!input.value) {
			this.#errors.taskInput = 'This field is required';
		} else {
			this.#errors.taskInput = '';
			const newTask: Task = {
				id: new Date().getTime(),
				todo: input.value,
				completed: false,
				userId: this.#userId,
				origin: TaskOrigin.MANUAL,
			};

			this.#todos = [...this.#todos, newTask];
		}
		this.render();
	}

	removeTaskById(id: number) {
		const filteredTodos = this.#todos.filter((task) => task.id !== id);

		this.#todos = [...filteredTodos];
		this.render();
	}

	toggleCompleteTask(target: HTMLElement) {
		const taskId = +target.id;
		const isCompleted = target.getAttribute('completed') === 'true';

		this.#todos = this.#todos.map((task) =>
			task.id === taskId ? { ...task, completed: isCompleted } : task
		);
		this.render();
	}

	async fetchTodoTaks() {
		const input = this.querySelector('.todo__task_limit_input') as HTMLInputElement;
		const limit = +input.value;
		if (limit < 1 || limit > 255) {
			this.#errors.limitInput = `Number must be greater than 1 and lesser than 255`;
			this.render();
			return;
		}
		try {
			this.#errors.limitInput = '';
			const response = await fetch(`https://dummyjson.com/todos?limit=${limit}`);
			if (!response.ok) {
				throw `${response.status}: ${response.statusText}`;
			}

			const data = await response.json();
			const fetchedTodos = data.todos.map((task: any) => ({
				...task,
				origin: TaskOrigin.FETCHED,
			}));
			this.#todos = [...this.#todos, ...fetchedTodos];
			this.showToastMessage('success', `Successfully fetched ${limit} items`);
		} catch (error: any) {
			this.showToastMessage('fail', error);
		}

		this.render();
	}

	showToastMessage(type: string, message: string) {
		const toast = document.createElement('div');
		toast.className = `todo__toast todo__toast--${type}`;
		toast.textContent = message;
		document.querySelector('body')?.appendChild(toast);

		setTimeout(() => {
			setTimeout(() => toast.remove());
		}, 3000);
	}

	deleteAllTasks() {
		this.#todos = [];
		this.render();
	}

	deleteTasksByOrigin(origin: TaskOrigin): void {
		const filteredTodos = this.#todos.filter((task) => task.origin !== origin);

		this.#todos = [...filteredTodos];
		this.render();
	}
}

customElements.define('todo-list', TodoList);
