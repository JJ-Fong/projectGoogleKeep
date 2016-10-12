/*
NOTE STRUCTURE

title: txt

*/
import moment from 'moment';

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
					new_item.last_mod = moment().format('LLLL');

				}
				new_state.push(new_item); 
			});
			return new_state; 
		}

		case 'TOOGLE_ARCHIVAR_ITEM': {
			let new_state = [];
			state.map ( item => {
				let new_item = item; 
				if (item.id === action.payload.id) {
					new_item.archived = !new_item.archived; 
					new_item.last_mod = moment().format('LLLL');
				}
				new_state.push(new_item); 
			});
			return new_state; 
		}

		case 'TOGGLE_EDIT_NOTE': {
			let new_state = [];
			state.map ( item => {
				let new_item = item; 
				console.log(new_item.onChange);
					
				if (item.id === action.payload.id) {
					new_item.onChange = !new_item.onChange; 
				}
				new_state.push(new_item); 
			});
			return new_state; 
		}

		case 'UPDATE_NOTE': {
			let new_state = [];
			state.map ( item => {
				let new_item = item; 
				if (item.id === action.payload.id) {
					new_item.title = action.payload.title;
					new_item.description = action.payload.description;  
					new_item.onChange = false;
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