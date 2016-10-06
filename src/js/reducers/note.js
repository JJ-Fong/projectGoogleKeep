/*
NOTE STRUCTURE

title: txt

*/

const notes = (state = [], action)  => {
	switch (action.type) {
		case 'ADD_NOTE':
			return [
				...state, 
				{ ...action.payload }
			];
		
		case 'MOD_ITEM_COLOR': {
			let new_state = [];
			state.map ( item => {
				let new_item = item; 
				if (item.id === action.payload.id) {
					new_item.color = action.payload.color; 
				}
				new_state.push(new_item); 
			});
			return new_state; 
		}

		case 'ARCHIVAR_ITEM': {
			let new_state = [];
			state.map ( item => {
				let new_item = item; 
				if (item.id === action.payload.id) {
					new_item.archived = action.payload.archived; 
				}
				new_state.push(new_item); 
			});
			return new_state; 
		}

		default: 
			return state; 
	}
}

export { notes }; 