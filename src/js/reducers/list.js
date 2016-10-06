/*

state = [] <= array de items 

def list
{
  id: integer,
  title: text, 
  todos: [ array de todo ],
  color : color,
  archived: boolean, 
  created: datetime, 
  last_modificated: datetime
}


def todo {
  id: integer,
  description: text, 
  completed: boolean //if parent is NOTE this field is disable //not show it in render?
}

*/

const lists = (state = [], action) => {
	switch (action.type) {
		case 'ADD_LIST': 
      return [
        ...state, 
        { ...action.payload }
      ];
    
    case 'MOD_ITEM_COLOR': {
      let new_state = [];
      state.map ( item => {
        let new_item = item; 
        if (item.id === action.payload.id) {
         }
        new_state.push(new_item); 
      });
      return new_state; 
    }

    default:
			return state; 
	}
}

const todo = (state = [], action) => {
	switch (action.type) {
		default:
			return state; 
	}
}

export { lists, todo };