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
import { archived_filter } from './reducers/archivedFilter'
//Se exporta el css
require('../styles/index.scss'); 

const { Component } = React;

//Se recupera el ultimo estado en el localStorage
const persistedState = localStorage.getItem('reduxState') ? JSON.parse(localStorage.getItem('reduxState')) : {}

//Se combinan los reductores que se importaron
const reducers = combineReducers({
  input,
  listItemsInput,
  lists, 
  notes,
  name_filter,
  item_filter,
  archived_filter
});

//Se crea el store con el reductor combinado, y el ultimo estado 
const store = createStore(reducers, persistedState);  

/*
  function: getVisibleItems
  params:
    list -> lista de items que se desea filtrar
    name_filter -> filtro por nombre actual
    item_filter  -> tipo de item que se desea filtrar 
    archive_filter -> separa los items archivados de los no archivados

  Este metodo sirve para obtener los items que el usuario debe de ser capaz de ver
  en su pantalla
*/

const getVisibleItems = (list, name_filter, item_filter, archived_filter) => {
  console.log(list); 
  switch (item_filter){ 
    case 'NOTAS': 
      list = list.filter(item => (item.item_code != 1)); 
      break; 
    case 'LISTAS': 
      list = list.filter(item => (item.item_code != 0)); 
      break;
  }
  console.log(list); 
  
  if (name_filter > '') { 
    list = list.filter(item => (item.title.toUpperCase().includes(name_filter.toUpperCase()))); 
  }
  
  console.log(list); 
  console.log(archived_filter);
  if (archived_filter === 'ARCHIVED') {
    list = list.filter(item => (!item.archived)); 
  } else {
    list = list.filter(item => (item.archived)); 
  }
  console.log(list); 
  return list; 
};

/*
  function: mergeListByDate
  params:
    list1, list2 -> Listas que se desean juntar, los elementos deben de tener un parametro 
                      "created" que exprese la fecha en la que fueron creados

  Este metodo hace merge a dos listas, para ordenarlas de manera que queden en orden
  del item mas antiguo al mas reciente
*/
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

//CODIGO REACT 

const SearchBox = ({ name_filter, item_filter }) => {
  let searchBox, itemBox, todoBox; 
  return (
    <div class="searchBox">
    {/* Tiltulo del projecto */}
      <div class="projectName">myKeep Project</div> 
      
      <div class="generalFilters">
      {/* Input para ingresar busqueda por nombre */}
        <input class="nameFilter" placeholder="Search" ref={ node => searchBox = node}
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

      {/* 

      ComboBox para elegir que items desea que se muestr 
      Opciones: 
        
        LISTAS Y NOTAS
        SOLO NOTAS
        SOLO LISTAS

      */}
        <select class="itemFilter" ref={ node => itemBox = node }
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
          value = { item_filter }>
            <option value="NOTAS Y LISTAS">Notas y Listas</option>
            <option value="NOTAS">Solo Notas</option>
            <option value="LISTAS">Solo Listas</option>
          </select>    
      </div>
    </div>
  );
};

const SideBar = () => {
  return (
    <div class="container">
      <div class="sidebar"> 
        <button class="dashButton" onClick = {
          () => {
            store.dispatch({
              type: 'SET_ARCHIVED_FILTER',
              payload:{
                filter: 'UNARCHIVED'
              }
            })
          }
        }>Dashboard</button> 
        <button class="archButton" onClick = {
          () => {
            store.dispatch({
              type: 'SET_ARCHIVED_FILTER',
              payload:{
                filter: 'ARCHIVED'
              }
            })
          }
        }>Archive</button> 
      </div> 
    </div> 
  );
}

const InputField = ({ selected, listitems }) => {
  let input;
  switch (selected) {

    //DEFAULT INPUT
    case 'DEFAULT':
      return (
        <div class="container"> 
          <div class="defaultInput">
            <input class="noteSelector" type="text" placeholder="Guardar nota..."
              onFocus = {
              () => {
                store.dispatch({type: 'WRITE_NOTE'});
              }
            }
            />
            <button class="listSelector"
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
        </div> 
      );

    //NOTE INPUT
    case 'NOTE_INPUT': {
      let input, content;
      return (
        <div class="container">
          <div class="noteInput">
            <input class="titleInput" type="text" placeholder="Titulo" ref={ node => input = node }/>
            <textarea placeholder="Nota" class="contentInput" ref={ node => content = node }/> 
            <div class="inputFooter">
            <button class="sendButton" onClick={
              () => {
                store.dispatch({
                  type: 'ADD_NOTE',
                  payload: {
                    id: v4(), 
                    title: input.value,
                    description: content.value,
                    color: '#ffff8d',
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
            <button class="cancelButton" onClick={
              () => {
                store.dispatch({type: 'DEFAULT'});
                input.value = ""; 
              }
            }>Cancelar</button> 
            </div> 
          </div> 
        </div> 
      );
    }
    //LIST INPUT
    case 'LIST_INPUT': {

      let lastItem = listitems[listitems.length-1];
      let items = listitems.filter(t => (t.id != lastItem.id));

      return (
        <div class="listInput">
          <input class="titleInput" type="text" placeholder="Titulo" ref={ node => input = node }></input>
          <div class="input-list">
            {
              items.map(item => (
                <Item  key = { item.id } identity={ item.id } text ={ item.text }/> 
              )
              )
            }
            <LastItem key = { lastItem.id }  identity={ lastItem.id } text={ lastItem.text } />
          </div> 
          <div class="inputFooter listInputFooter"> 
            <button class="sendButton" onClick={
              () => {
                listitems = listitems.filter(t => (t.text > ""));
                store.dispatch(
                  {
                    type: 'ADD_LIST', 
                    payload: {
                      id: v4(), 
                      title: input.value,
                      color: '#ffff8d',
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
            <button class="cancelButton" onClick={
              () => {
                store.dispatch({type: 'DEFAULT'});
                store.dispatch({type: 'DELETE_ALL_LIST_ITEMS'});
                input.value = ""; 
              }
            }>Cancelar</button>
        </div> 
        </div> 
      );
    }
  };
};

const Item = ({ identity, text }) => {
    let input; 
    return (
      <div class="item">
      <input  class="itemInput" placeholder="new todo" type="text" ref={ node => input = node } 
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
      <button class="itemButton"  onClick={
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
    <div class="lastItem">
    <input class="itemInput" type="text" placeholder="new todo" ref={ node => input = node } 
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
    <button class="itemButton"
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

const AppBody = ({ lists, notes , name_filter, item_filter, archived_filter}) => { 
  let items = mergeListByDate(lists, notes); 
  items = getVisibleItems(items, name_filter, item_filter, archived_filter);
  if (items.length === 0){
    return (
      <div>
        <h1> Usted no tienen items en este directorio </h1> 
      </div> 
    );
  }
  return (
    <div class="itemList"> 
    {
      items.map( item => (
        item.item_code===0 ? <Note key={item.id} note={ item }/> : <List key={item.id} list={ item }/> 
      )
      )
    }
    </div> 
  ) 
};

const Note = ({ note }) => {
  return (
    <div class="note"
      style =  {{
        backgroundColor: note.color
      }}
    >
      <div class="title"> { note.title }</div> 
      <div class="content"> { note.description } </div>
      <cite class="created"> Created { note.created }</cite> <br/>
      <cite class="modified"> Last modified { note.last_mod } </cite> 
      <ItemFooter item = { note }/> 
    </div> 
  ); 
}; 

const List = ({ list , todo_filter }) => {
  return (
    <div class="list"
      style =  {{
        backgroundColor: list.color,
    }}
    >
      <div class="title"> { list.title }</div> 
      <ul>
      {
        list.todos.map( todo => (
          <Todo key={ todo.id } parent={ list.id } todo={ todo }/> 
        )
        )
      }
      </ul>
      <cite class="created"> Created { list.created }</cite> <br/>
      <cite class="modified"> Last modified { list.last_mod } </cite> 
      <ListFooter item = { list }/> 
    </div>  
  );
}; 

const Todo = ({ parent, todo }) => {
  return (
    <div class="todo"
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
};

const ItemFooter = ({ item }) => {
  let combobox; 
  return (
    <div class="itemFooter" style={{ alignContent: "right", margin: "10px 0"}}>
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
        <option value="#ffff8d" style={{ backgroundColor: "#ffff8d" }}></option>
        <option value="#80d8ff" style={{ backgroundColor: "#80d8ff" }}></option>
        <option value="pink" style={{ backgroundColor: "pink" }}></option>
        <option value="#a7ffeb" style={{ backgroundColor: "#a7ffeb"}}></option>
      </select>

      <button
      onClick = {
        () => {
          store.dispatch({
            type: 'TOOGLE_ARCHIVAR_ITEM', 
            payload: {
              id: item.id
            }
          })
        }
      }
      >{ item.archived ? 'Archivar' : 'Desarchivar'}</button> 
      <button>Edit</button> 
    </div> 
  );
}; 

const ListFooter = ({ item }) => {
  let combobox;
  let new_todo;  
  return (
    <div class="listFooter" style={{ alignContent: "right", margin: "10px 0"}}>
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
      }>+</button>  
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

const KeepApp = ({ input, listItemsInput, lists, notes, name_filter, item_filter, todo_filter, archived_filter }) => {
  return (
    <div> 
      
      <SearchBox 
        name_filter={ name_filter }
        item_filter={ item_filter }
      /> 

      <SideBar/>
      
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
        archived_filter={ archived_filter }
      /> 
    
    </div>
  );
};

const render = () => {
  console.log(store.getState());
  ReactDOM.render
  ( <KeepApp { ...store.getState() }/>,
    document.getElementById('root')
  );
};

render(); 

store.subscribe(render);
store.subscribe(
  ()=>{
  localStorage.setItem('reduxState', JSON.stringify(store.getState()))
  }
);