const archived_filter = (state = 'UNARCHIVED', action) => {
	switch (action.type) {
		case 'SET_ARCHIVED_FILTER':
			return action.payload.filter;
		default: 
			return state; 
	}
}

export { archived_filter };