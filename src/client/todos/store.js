import * as actions from './actions'
import dispatcher from '../dispatcher'
import {Range, Record} from 'immutable'
import {getRandomString} from '../../lib/getrandomstring'
import {newTodoCursor, todosCursor} from '../state'

// Note store is state-less. It's must for isomorphic app.

const TodoRecord = Record({
  completed: false,
  id: '',
  title: ''
})

let isCompleted = todo => todo.get('completed')

export const MAX_TODO_TITLE_LENGTH = 42

export const dispatchToken = dispatcher.register((payload) => {
  let {action, data} = payload

  switch (action) {
    case actions.addTodo:
      let title = getNewTodo().get('title').trim()
      if (!title) return
      // Create a nice client unique enough id.
      let id = getRandomString()
      todosCursor(todos => todos.set(id, new TodoRecord({id, title}).toMap()))
      newTodoCursor(todo => new TodoRecord().toMap())
      break

    case actions.onNewTodoFieldChange:
      let {name, value} = data
      switch (name) {
        case 'title':
          value = value.slice(0, MAX_TODO_TITLE_LENGTH)
          break
      }
      newTodoCursor(todo => todo.set(name, value))
      break

    case actions.toggleTodo:
      todosCursor(todos => {
        return todos.update(data.get('id'), (todo) => {
          return todo.set('completed', !todo.get('completed'))
        })
      })
      break

    case actions.destroyTodo:
      todosCursor(todos => todos.delete(data.get('id')))
      break

    case actions.clearCompleted:
      todosCursor(todos => getRemaining())
      break

    case actions.toggleAll:
      let {checked} = data
      todosCursor(todos => todos.map(todo => todo.set('completed', checked)))
      break

    case actions.saveTodo:
      let {todo, props} = data
      todosCursor(todos => {
        return todos.update(todo.get('id'), (todo) => todo.merge(props))
      })
      break

    // For performance testing.
    case actions.addHundredTodos:
      todosCursor(todos => {
        return todos.withMutations(list => {
          Range(0, 100).forEach(i => {
            let id = getRandomString()
            list.set(id, new TodoRecord({
              completed: false,
              id: id,
              title: `Item #${id}`
            }).toMap())
          })
        })
      })
      break

  }

})

export function getNewTodo() {
  return newTodoCursor()
}

export function getTodos() {
  return todosCursor()
}

export function getCompleted() {
  return getTodos().filter(isCompleted)
}

export function getRemaining() {
  return getTodos().filterNot(isCompleted)
}

export function allCompleted() {
  return getTodos().every(isCompleted)
}
