import { createStore, combineReducers } from 'redux';
import React from 'react';
import ReactDOM from 'react-dom';
import deepFreeze from 'deep-freeze';
import expect from 'expect';
import moment from 'moment';
import v4 from 'uuid-v4';
import { input, listItemsInput } from './reducers/input'; 
import { lists, todo } from './reducers/list'
import { notes } from './reducers/note'

const { Component } = React;

const persistedState = localStorage.getItem('reduxState') ? JSON.parse(localStorage.getItem('reduxState')) : {}

const reducers = combineReducers({
  input,
  listItemsInput,
  lists, 
  notes
});

const store = createStore(reducers, persistedState); 

/*

state = {
  selector: (0|1|2), 
  item: [(item)*]
} 

*/

const mergeListByDate = (list1, list2) => { 
  let final_list = []
  let list1Counter = 0; 
  let list2Counter = 0; 
  while ((list1Counter < list1.length)&&(list2Counter < list2.length)) { 
    let currentItem1 = list1[list1Counter]; 
    let currentItem2 = list2[list2Counter]; 
    if (currentItem2.created_int > currentItem1.created_int) { 

    } else {
      
    }
  }
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
      style={{ width: "50px" }}>
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
      <cite> Creado el { note.created }</cite> <br/>
      <cite> Ultima modificacion: { note.last_mod } </cite> 
      <ItemFooter item = { note }/> 
    </div> 
  ); 
}; 

const List = ({ list }) => {
  return (
    <div>
    </div> 
  );
}; 

const AppBody = ({ lists, notes }) => { 
  console.log(notes); 
  return (
    <div> 
    {
      notes.map( note => (
        <Note  key = { note.id } note ={ note }/> 
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
                  last_mod_int: Date.now()
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
          {
            console.log(lastItem)
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
                    titulo: input.value,
                    created: moment().format('LLLL'),
                    last_mod: moment().format('LLLL'),
                    created_int: Date.now(),
                    last_mod_int: Date.now(), 
                    archived: false, 
                    todos: listitems
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

const KeepApp = ({ input, listItemsInput, list, notes }) => {
  return (
    <div> 
      <h1>Keep Project</h1>
      <InputField
        selected={ input }
        listitems={ listItemsInput } 
      />
      <AppBody 
        lists = { lists }
        notes = { notes }
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


store.subscribe(()=>{
  localStorage.setItem('reduxState', JSON.stringify(store.getState()))
})