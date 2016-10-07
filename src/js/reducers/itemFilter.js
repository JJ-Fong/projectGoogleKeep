const item_filter = (state = 'NOTAS Y LISTAS', action) => {
	switch (action.type) { 
		case 'SET_ITEM_FILTER':
			return action.payload.filter;
		default:
			return state; 
	}
}

export { item_filter }; 