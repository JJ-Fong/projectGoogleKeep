/*
state: 
	0 - selector
	1 - Note input
	2 - List Input
*/

const input = (state = 'DEFAULT', action) => {
	switch (action.type) {
		case 'WRITE_NOTE':
			return 'NOTE_INPUT'; 
		case 'WRITE_LIST':
			return 'LIST_INPUT'; 
		case 'DEFAULT': 
			return 'DEFAULT';
		default:
			return state; 
	}
}

const listItemsInput = (state = [], action ) => {
	switch (action.type) {
		case 'ADD_LIST_ITEM_INPUT':
			return [
				...state,
				{ ...action.payload }
			];
		case 'MOD_LIST_ITEM_INPUT':
			let new_state = [];
			state.map ( item => {
				if (item.id === action.payload.id) {
					item.text = action.payload.text; 
				}
				new_state.push(item); 
			});
			return new_state; 
		case 'DEL_LIST_ITEM_INPUT': {
				let new_state = state.filter(item => (item.id != action.payload.id));
				return new_state; 
			}
		case 'DELETE_ALL_LIST_ITEMS':
				return [];
		default: 
			return state; 
	}
}

export { input, listItemsInput };