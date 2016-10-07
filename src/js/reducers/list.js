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
        if (new_item.id === action.payload.id) {
          new_item.color = action.payload.color; 
        }
        new_state.push(new_item); 
      });
      return new_state; 
    }

    case 'ADD_TODO': {
      let new_state = [];
      state.map ( item => {
        let new_item = item; 
        if (new_item.id === action.payload.parent_id) {
          new_item.todos.push({
            id: action.payload.child_id,
            text: action.payload.text,
            completed: false
          }); 
        }
        new_state.push(new_item); 
      });
      return new_state; 
    }
    
    case 'DEL_TODO': {
      let new_state = [];
      state.map ( item => {
        let new_item = item; 
        if (new_item.id === action.payload.parent_id) {
          new_item.todos = new_item.todos.filter(t => (t.id != action.payload.child_id)) 
        }
        new_state.push(new_item); 
      });
      return new_state; 
    }

    case 'TOGGLE_TODO': {
      let new_state = [];
      state.map ( item => {
        let new_item = item; 
        if (new_item.id === action.payload.parent_id) {
          new_item.todos.map( todo => {
            if (todo.id === action.payload.child_id) {
              todo.completed = !todo.completed;
            }
          }
          );
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

export { lists };