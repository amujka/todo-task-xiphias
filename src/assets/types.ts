export enum TaskOrigin {
	MANUAL = 'manualyAdded',
	FETCHED = 'fetched',
}
export interface Task {
	id: number;
	todo: string;
	completed: boolean;
	userId: number;
	origin: TaskOrigin;
}
