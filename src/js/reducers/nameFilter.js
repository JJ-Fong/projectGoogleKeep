const name_filter = (state = '', action) => {
	switch (action.type) { 
		case 'SET_NAME_FILTER':
			return action.payload.filter;
		default:
			return state; 
	}
}

export { name_filter }; 