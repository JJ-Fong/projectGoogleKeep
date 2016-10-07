import { createStore, combineReducers } from 'redux';
import React from 'react';
import ReactDOM from 'react-dom';
import deepFreeze from 'deep-freeze';
import expect from 'expect';
import moment from 'moment';
import v4 from 'uuid-v4';
import { input, listItemsInput } from './reducers/input'; 
import { lists } from './reducers/list'
import { notes } from './reducers/note'
import { name_filter } from './reducers/nameFilter'
import { item_filter } from './reducers/itemFilter'
import { todo_filter } from './reducers/todoFilter'

const { Component } = React;

const persistedState = localStorage.getItem('reduxState') ? JSON.parse(localStorage.getItem('reduxState')) : {}

const reducers = combineReducers({
  input,
  listItemsInput,
  lists, 
  notes,
  name_filter,
  item_filter
});

const store = createStore(reducers, persistedState); 

const getVisibleItems = (list, name_filter, item_filter) => {
  switch (item_filter){ 
    case 'NOTAS': 
      list = list.filter(item => (item.item_code != 1)); 
      break; 
    case 'LISTAS': 
      list = list.filter(item => (item.item_code != 0)); 
      break;
  }
  if (name_filter > '') { 
    list = list.filter(item => (item.title.includes(name_filter))); 
  }
  list = list.filter(item => (!item.archived)); 
  return list; 
};

const mergeListByDate = (list1, list2) => { 
  let final_list = []
  let list1Counter = 0; 
  let list2Counter = 0; 
  let currentItem1, currentItem2; 

  while ((list1Counter < list1.length)&&(list2Counter < list2.length)) { 
    currentItem1 = list1[list1Counter]; 
    currentItem2 = list2[list2Counter]; 
    if (currentItem2.created_int < currentItem1.created_int) { 
      final_list.push(currentItem2); 
      list2Counter = list2Counter + 1; 
    } else {
      final_list.push(currentItem1); 
      list1Counter = list1Counter + 1; 
    }
  }

  while (list1Counter < list1.length) { 
    currentItem1 = list1[list1Counter];
    final_list.push(currentItem1); 
    list1Counter = list1Counter + 1; 
  }

  while (list2Counter < list2.length) { 
    currentItem2 = list2[list2Counter];
    final_list.push(currentItem2); 
    list2Counter = list2Counter + 1; 
  }

  return final_list; 
}; 

const ItemFooter = ({ item }) => {
  let combobox; 
  return (
    <div style={{ alignContent: "right", margin: "10px 0"}}>
      Color: <select ref={ node => combobox = node }
      onChange = { 
        () => {
          store.dispatch(
            {
              type: 'MOD_ITEM_COLOR', 
              payload: {
                color: combobox.value,
                id: item.id
              }
            }
          ); 
        }
      }
      style={{ width: "100px" }}>
        <option value="yellow" style={{ backgroundColor: "yellow" }}></option>
        <option value="blue" style={{ backgroundColor: "blue" }}></option>
        <option value="pink" style={{ backgroundColor: "pink" }}></option>
        <option value="green" style={{ backgroundColor: "green"}}></option>
      </select>

      <button>Archivar</button> 
      <button>Edit</button> 
    </div> 
  );
}; 

const ListFooter = ({ item }) => {
  let combobox;
  let new_todo;  
  return (
    <div style={{ alignContent: "right", margin: "10px 0"}}>
      Color: <select ref={ node => combobox = node }
      onChange = { 
        () => {
          store.dispatch(
            {
              type: 'MOD_ITEM_COLOR', 
              payload: {
                color: combobox.value,
                id: item.id
              }
            }
          ); 
        }
      }
      style={{ width: "100px" }}>
        <option value="yellow" style={{ backgroundColor: "yellow" }}></option>
        <option value="blue" style={{ backgroundColor: "blue" }}></option>
        <option value="pink" style={{ backgroundColor: "pink" }}></option>
        <option value="green" style={{ backgroundColor: "green"}}></option>
      </select>

      <button>Archivar</button> 
      <button>Edit</button>
      <input placeholder="Nuevo Input" ref={ node => new_todo = node}/> 
      <button
      onClick = {
        () => {
          store.dispatch({
            type: 'ADD_TODO', 
            payload: {
              parent_id: item.id, 
              child_id: v4(), 
              text: new_todo.value, 
            }
          });
          new_todo.value = "";
        }
      }>Agregar</button>  
    </div> 
  );
};

const Note = ({ note }) => {
  return (
    <div 
      style =  {{
        backgroundColor: note.color,
        padding: "10px",
        margin: "10px"
      }}
    >
      <h1> { note.title }</h1> 
      <h3> { note.description } </h3>
      <cite> Created { note.created }</cite> <br/>
      <cite> Last modified { note.last_mod } </cite> 
      <ItemFooter item = { note }/> 
    </div> 
  ); 
}; 

const Todo = ({ parent, todo }) => {
  return (
    <div
    onClick = {
      () => {
        store.dispatch({
          type: 'TOGGLE_TODO',
          payload: {
            parent_id: parent, 
            child_id: todo.id
          }
        })
      }
    }
    ><li style={{
      textDecoration: todo.completed ? 'line-through' : 'none'
    }}>{ todo.text }<button 
    onClick = {
      () => {
        store.dispatch({
          type: 'DEL_TODO',
          payload: {
            parent_id: parent,
            child_id: todo.id
          }
        })
      }
    }>X</button></li></div>
  ); 
}

const List = ({ list , todo_filter }) => {
  return (
    <div 
      style =  {{
        backgroundColor: list.color,
        padding: "10px",
        margin: "10px",
        roundRatio: "10%"
      }}
    >
      <h1> { list.title }</h1> 
      <ul>
      {
        list.todos.map( todo => (
          <Todo key={ todo.id } parent={ list.id } todo={ todo }/> 
        )
        )
      }
      </ul>
      <cite> Created { list.created }</cite> <br/>
      <cite> Last modified { list.last_mod } </cite> 
      <ListFooter item = { list }/> 
    </div>  
  );
}; 

const AppBody = ({ lists, notes , name_filter, item_filter, todo_filter}) => { 
  let items = mergeListByDate(lists, notes); 
  items = getVisibleItems(items, name_filter, item_filter, todo_filter);
  return (
    <div> 
    {
      items.map( item => (
        item.item_code===0 ? <Note key={item.id} note={ item }/> : <List key={item.id} list={ item }/> 
      )
      )
    }
    </div> 
  ) 
};

const InputField = ({ selected, listitems }) => {
  let input;
  switch (selected) {

    //DEFAULT INPUT
    case 'DEFAULT':
      return (
        <div>
        <input type="text" placeholder="Guardar nota..."
          onFocus = {
          () => {
            store.dispatch({type: 'WRITE_NOTE'});
          }
        }
        class="select-input"
        />
        <button 
          onClick = {
            () => {
              store.dispatch({type: 'WRITE_LIST'}); 
              store.dispatch({
                type: 'ADD_LIST_ITEM_INPUT', 
                payload: {
                  text: "", 
                  id: v4(),
                  completed: false 
                }
              })
            }
          }
        >Lista</button> 
        </div> 
      );

    //NOTE INPUT
    case 'NOTE_INPUT': {
      let input, content;
      return (
        <div>
          <input type="text" placeholder="Titulo" ref={ node => input = node }/>
          <textarea ref={ node => content = node }/> 
          <button onClick={
            () => {
              store.dispatch({
                type: 'ADD_NOTE',
                payload: {
                  id: v4(), 
                  title: input.value,
                  description: content.value,
                  color: 'yellow',
                  archived: false, 
                  created: moment().format('LLLL'),
                  last_mod: moment().format('LLLL'),
                  created_int: Date.now(), 
                  last_mod_int: Date.now(),
                  item_code: 0
                }
              });
              input.value = ""; 
              content.value= "";
              store.dispatch({type: 'DEFAULT'}); 
            }
          }>Enviar</button> 
          <button onClick={
            () => {
              store.dispatch({type: 'DEFAULT'});
              input.value = ""; 
            }
          }>Cancelar</button> 
        </div> 
      );
    }
    //LIST INPUT
    case 'LIST_INPUT': {

      let lastItem = listitems[listitems.length-1];
      let items = listitems.filter(t => (t.id != lastItem.id));

      return (
        <div>
          <input type="text" placeholder="Titulo" ref={ node => input = node }></input>
          {
            items.map(item => (
              <Item  key = { item.id } identity={ item.id } text ={ item.text }/> 
            )
            )
          }
          <LastItem key = { lastItem.id }  identity={ lastItem.id } text={ lastItem.text } />
          <button onClick={
            () => {
              listitems = listitems.filter(t => (t.text > ""));
              store.dispatch(
                {
                  type: 'ADD_LIST', 
                  payload: {
                    id: v4(), 
                    title: input.value,
                    color: 'yellow',
                    created: moment().format('LLLL'),
                    last_mod: moment().format('LLLL'),
                    created_int: Date.now(),
                    last_mod_int: Date.now(), 
                    archived: false, 
                    todos: listitems,
                    item_code: 1
                  }
                }
              ); 
              store.dispatch({type: 'DEFAULT'});
              store.dispatch({type: 'DELETE_ALL_LIST_ITEMS'});
              input.value = "";  
            }
          }
          >Enviar</button>
          <button onClick={
            () => {
              store.dispatch({type: 'DEFAULT'});
              store.dispatch({type: 'DELETE_ALL_LIST_ITEMS'});
              input.value = ""; 
            }
          }>Cancelar</button>
        </div> 
      );
    }
  };
}; 

const Item = ({ identity, text }) => {
    let input; 
    return (
      <div>
      <input  type="text" ref={ node => input = node } 
      onChange={
        () => {
          store.dispatch({
            type: 'MOD_LIST_ITEM_INPUT', 
            payload: {
              text: input.value, 
              id:  identity 
            }
          });
        }
      }
      value = { text }/>
      <button onClick={
        () => {
          store.dispatch({
            type: 'DEL_LIST_ITEM_INPUT',
            payload: {
              id: identity
            }
          });
        }
      }>X</button> 
      </div>
    ); 
};

const LastItem = ({ identity, text }) => {   
  let input; 
  return (
    <div>
    <input type="text" ref={ node => input = node } 
    onChange={
      () => {
        store.dispatch({
          type: 'MOD_LIST_ITEM_INPUT', 
          payload: {
            text: input.value, 
            id:  identity 
          }
        });
      }
    }
    value = { text } />
    <button 
    onClick={
      () => {
        store.dispatch({
          type: 'ADD_LIST_ITEM_INPUT', 
          payload: {
            id: v4(),
            text: "",
            completed: false
          }
        });
      }
    }
    >+</button>
    </div>
  ); 
};

const SearchBox = ({ name_filter, item_filter, todo_filter }) => {
  let searchBox, itemBox, todoBox; 
  return (
    <div>
    <input placeholder="SearchBox" ref={ node => searchBox = node}
    onChange = {
      () => {
        store.dispatch({
          type: 'SET_NAME_FILTER',
          payload: {
            filter: searchBox.value
          }
        });
      }
    }
    value = { name_filter }
    /> 
    <select ref={ node => itemBox = node }
      onChange = { 
        () => {
          store.dispatch(
            {
              type: 'SET_ITEM_FILTER', 
              payload: {
                filter: itemBox.value
              }
            }
          ); 
        }
      }
      style={{ width: "200px" }}
      value = { item_filter }>
        <option value="NOTAS Y LISTAS">Notas y Listas</option>
        <option value="NOTAS">Solo Notas</option>
        <option value="LISTAS">Solo Listas</option>
      </select>   
      <select ref={ node => todoBox = node }
      onChange = { 
        () => {
          store.dispatch(
            {
              type: 'SET_TODO_FILTER', 
              payload: {
                filter: todoBox.value
              }
            }
          ); 
        }
      }
      style={{ width: "200px" }}
      value = { todo_filter }>
        <option value="ALL">Todos</option>
        <option value="COMPLETED">Completados</option>
        <option value="UNCOMPLETE">Por Completar</option>
      </select>  
    </div>
  );
}

const KeepApp = ({ input, listItemsInput, lists, notes, name_filter, item_filter, todo_filter}) => {
  return (
    <div> 
      <h1>Keep Project</h1>
      <SearchBox 
        name_filter={ name_filter }
        item_filter={ item_filter }
        todo_filter={ todo_filter } 
      /> 

      <InputField
        selected={ input }
        listitems={ listItemsInput } 
      />
      <AppBody 
        lists = { lists }
        notes = { notes }
        name_filter={ name_filter }
        item_filter={ item_filter }
        todo_filter={ todo_filter }
      /> 
    </div>
  );
};

const render = () => {
  ReactDOM.render
  ( <KeepApp { ...store.getState() }/>,
    document.getElementById('root')
  );
};

render(); 
store.subscribe(render);


store.subscribe(()=>{
  localStorage.setItem('reduxState', JSON.stringify(store.getState()))
})