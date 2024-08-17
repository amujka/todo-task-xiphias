import { Task } from '../../assets/types';

export class TodoList extends HTMLElement {
	#todos: Task[] = [];
	#errors = {
		inputError: '',
		fetchError: '',
	};
	#limit: number = 5;
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

	render() {
		const completedTasks = this.#todos.filter((task) => task.completed).length;
		this.innerHTML = `
		<div class="todo">
		<div class="todo__header">
			<h2 class="todo__title">Todo List</h2>
			<p class="todo__completed_tasks_num">Done(${completedTasks})</p>
		</div>
			<div class="todo__form">
				<div class="todo__input_container">
					<label>New task</label>
					<input type="text" class="todo__new_task_input" placeholder="Add a new item" />
					${
						this.#errors.inputError
							? `<small class="todo__error">${
									this.#errors.inputError
							  }</small>`
							: ''
					}
					<button class="todo__add_task_btn">Add task</button>
				</div>
				<div class="todo__input_container">
						<label>Number of tasks</label>
						<input type="text" />
						<button class="todo__fetch_tasks_btn">Fetch task</button>
				</div>
			</div>
			<ul class="todo__list">
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
			</ul>
		</div>
    `;
		this.querySelector('.todo__add_task_btn')?.addEventListener('click', () =>
			this.addTodoTask()
		);

		this.querySelector('.todo__fetch_tasks_btn')?.addEventListener('click', () =>
			this.fetchTodoTaks()
		);
	}

	addTodoTask() {
		const input = this.querySelector<HTMLInputElement>('.todo__new_task_input');
		if (!input?.value) {
			this.#errors.inputError = 'Please enter a task';
		} else {
			this.#errors.inputError = '';
			const newTask: Task = {
				id: new Date().getTime(),
				todo: input.value,
				completed: false,
				userId: this.#userId,
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
		try {
			const response = await fetch(
				`https://dummyjson.com/todos?limit=${this.#limit}`
			);
			if (!response.ok) {
				throw `${response.status}: ${response.statusText}`;
			}
			const data = await response.json();
			this.#todos = [...this.#todos, ...data.todos];
		} catch (error) {
			this.#errors.fetchError = error as string;
		}
		this.render();
	}
}

customElements.define('todo-list', TodoList);
