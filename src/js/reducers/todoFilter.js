const todo_filter = (state = 'ALL', action) => {
	switch (action.type) { 
		case 'SET_TODO_FILTER':
			return action.payload.filter;
		default:
			return state; 
	}
}

export { todo_filter }; 