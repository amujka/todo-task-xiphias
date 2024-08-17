export class TodoTask extends HTMLElement {
	#completed: boolean = false;
	#todo: string = '';
	constructor() {
		super();
		this.#todo = this.getAttribute('todo') || '';
		this.#completed = this.getAttribute('completed') === 'true';
		this.render();
	}

	static get observedAttributes() {
		return ['todo', 'completed'];
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		switch (name) {
			case 'text':
				this.#todo = newValue || '';
				break;
			case 'completed':
				this.#completed = newValue === 'true';
				break;
		}
		this.render();
	}

	get template() {
		return `
        <li class="todo__task ${this.#completed ? 'todo__task--completed' : ''}">
			<h2 class="todo__task_title">${this.#todo}</h2>
			<div class="todo__task_actions">
				<input type="checkbox" class="todo__task_completed" ${this.#completed ? 'checked' : ''}/>
				<span class="todo__remove_task_btn fa fa-trash-o"></span>
			</div>
        </li>
    `;
	}

	render() {
		this.innerHTML = `${this.template}`;
		this.querySelector('.todo__remove_task_btn')!.addEventListener('click', () => {
			this.dispatchEvent(
				new CustomEvent('delete-task', {
					bubbles: true,
					composed: true,
				})
			);
		});

		this.querySelector('.todo__task_completed')?.addEventListener('change', (e) => {
			const isChecked = (e.target as HTMLInputElement).checked;
			console.log('isChecked', isChecked);

			this.setAttribute('completed', isChecked.toString());

			this.dispatchEvent(
				new CustomEvent('toggle-complete-task', {
					bubbles: true,
					composed: true,
				})
			);
		});
	}
}

customElements.define('todo-task', TodoTask);
