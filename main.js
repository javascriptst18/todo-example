/* Three main elements to manipulate. These can be global as we need to access
 * them from different functions in our application.
 */
const incompleteTodosList = document.getElementById('incomplete-todos');
const completeTodosList = document.getElementById('complete-todos');
const inputField = document.getElementById('input-field');
const clearAll = document.getElementById('clear-all');

/* A few example todos, they have a randomly generated id, you can also use
 * like: id: 1, id: 2 etc. Store them as objects in an array for easier handling
 * with localstorage later on.
 */
let todoArray = [
  {
    id: '_317kdlbkp',
    text: 'Buy Milk',
    complete: false
  },
  {
    id: '_a7p2joa8h',
    text: 'Buy a house',
    complete: true
  }
];

/* The function that generates a random string to use as an id. It doesn't really matter
 * how the ID looks just that it is 'unique' so we can easily distinguish each individual
 * todo so we can filter and remove each todo and don't have to use index to filter.
 */
function generateID() {
  return `_${Math.random().toString(36).substr(2, 9)}`;
}

/* This function takes the newly created todo-object and returns a string
 * that will be later appended to the DOM. Why I have choosen to put it
 * in a separate function is because I call it on two different locations
 * in the code. Create an ID on the <li> to easier get it from the DOM later on.
 * I'm also adding a inline if-statement (value? true : false) and checking if the
 * todo is completed, if that's the case I'm adding a 'checked' class to that span.
 * otherwise I'm returning an empty string and do not set that class.
 */
function createTodoElement(newTodo) {
  const listItemElement = document.createElement('li');
  const spanElement = document.createElement('span');
  const removeButtonElement = document.createElement('button');
  const toggleCompleteButtonElement = document.createElement('button');

  listItemElement.classList.add('todo-item');
  listItemElement.id = newTodo.id;
  if(newTodo.complete){
    spanElement.classList.add('checked');
  }
  spanElement.innerText = newTodo.text;
  removeButtonElement.classList.add('button', 'remove');
  removeButtonElement.innerText = '✖︎';
  removeButtonElement.addEventListener('click', removeTodo);
  toggleCompleteButtonElement.classList.add('button', 'complete');
  toggleCompleteButtonElement.innerText = "✔︎";
  toggleCompleteButtonElement.addEventListener('click', toggleTodo);

  listItemElement.appendChild(spanElement);
  listItemElement.appendChild(removeButtonElement);
  listItemElement.appendChild(toggleCompleteButtonElement);
  return listItemElement;
}

/* This function is bound to an eventlistener further down. Removes the todo
 * from both the DOM and filter it out from the earlier declared array `todosArray`
 */
function removeTodo() {
  /* `this` refers to the button clicked. The buttons parent is the actual
   * <li>-item that we want. Save that in a variable. The container 
   * (incomplete or incomplete) is the parent of that <li>-item, save that too
   */
  const listItem = this.parentElement;
  const container = this.parentElement.parentElement;
  /* Remove from DOM */
  container.removeChild(listItem);
  /* And replace the current array of items with a filtered copy of the array.
   * `.filter()` takes a function as an argument. Return everything except
   * the object which matches the id of the item we are trying to remove.
   */
  todoArray = todoArray.filter(function(todo) {
    return todo.id !== listItem.id;
  });
  saveToLocalStorage(todoArray);
}

/* toggle function bound to the checkbox-button. Gets the container
 * (incomplete or complete) and checks which container it is currently in.
 * When we append the element to one of the lists (<ul>) it gets transfered
 * automatically, we don't need to removeChild() after we appended it
 */
function toggleTodo() {
  const todoItem = this.parentElement;
  const container = this.parentElement.parentElement;
  /* I added the 'checked' class which does line-through on the span
   * inside of the element, that's why I'm using `firstElementChild` and
   * not applying the class directly to the element */
  todoItem.firstElementChild.classList.toggle('checked');
  if (container === incompleteTodosList) {
    completeTodosList.appendChild(todoItem);
  } else {
    incompleteTodosList.appendChild(todoItem);
  }
}

/*
 * This function recieves the value from the input field via an
 * onchange event listener. It creates a new todo with a unique ID,
 * the value to be added and a boolean for completed or not completed.
 * We add the todo to the array of todo and simultaneous create a new
 * <li>-item with the function `createTodoElement`. We then append
 * this <li>-item to the dom. When this is done we need to add eventlisteners
 * to the newly created todo item so we call the function `addListenersToListItem`
 * from before. We then clear the value of the input field
 */
function createAndStoreTodoItem(newTodoValue) {
  // If the input isn't empty
  if(validateInput(newTodoValue)){
    // Create a new object with or parameter
    const newTodo = {
      id: generateID(),
      text: newTodoValue,
      complete: false
    };
    // Add it to the global array
    todoArray.push(newTodo);
    // Also create a new element to add to the DOM
    const newTodoElement = createTodoElement(newTodo);
    // Add it at the end of the list
    incompleteTodosList.appendChild(newTodoElement);
    // This function Clear the input field  (my own function)
    resetInput();
    // This function removes any error if present (my own function)
    resetError();
    saveToLocalStorage(todoArray);
  } else {
    // If the input is empty, display error
    displayError(`You cannot add an empty todo`);
  }
}

function validateInput(newTodoValue){
  // If the value equals empty string, the input is not valid: return false
  // `.trim()` removes extra whitespace at the end and start of a string
  if(newTodoValue.trim() === ""){
    return false;
  }
  // We don't need an else, if the if is not triggered, it is automatically this value.
  return true;
}

function displayError(errorMessage){
  // find the error container
  const errorElement = document.querySelector('.error');
  // Set the message that is being passed in from `createAndStoreTodoItem`
  errorElement.innerText = errorMessage;
  // Also set it to a red color
  inputField.style.borderColor = "#ec4570";
}

function resetError(){
  // Find the error container and return it back to white color and empty text
  const errorElement = document.querySelector('.error');
  errorElement.innerText = '';
  inputField.style.borderColor = "#fff";
}

/* A value of an input can also be set, like 'innerText', just set it to empty string */
function resetInput(){
  inputField.value = '';
}

/*
 * this function loops through the array of todos when we first visit the page.
 * I creates a new <li>-item by calling `createTodoElement`. No need to create
 * a new todo we only need to add it to the DOM. We then check the status of the
 * item, is it completed, add it to the `compeletedTodosList`-ul, if not, it is by
 * default to be added to the `incompleteTodosList`-ul
 */
function loadTodos() {
  todoArray = getFromLocalStorage(todoArray);
  for (const todo of todoArray) {
    const newTodoElement = createTodoElement(todo);
    if (todo.complete) {
      completeTodosList.appendChild(newTodoElement);
    } else {
      incompleteTodosList.appendChild(newTodoElement);
    }
  }
}

/* Clears both <ul>-list with no regard to content, just replace the HTML of the whole list */
function clearAllTodos(){
  incompleteTodosList.innerHTML = "";
  completeTodosList.innerHTML = "";
}

function getFromLocalStorage(todoArray){
  const dataFromLocalStorage = localStorage.getItem('todos');
  if(dataFromLocalStorage){
    return JSON.parse(dataFromLocalStorage);
  }
  return todoArray;
}

function saveToLocalStorage(todoArray){
  const stringifiedArray = JSON.stringify(todoArray);
  localStorage.setItem('todos', stringifiedArray);
}

/* We add a listener for onchange, which is when we press enter or blur out of
 * the input field. When this happens, call the function which creates and adds
 * the item to the array and to the DOM. `this` is the input-field in HTML. `this.value`
 * is the text that we have written inside of it. `this.value` will become the parameter
 * `newTodoValue` inside of `createAndStoreTodoItem`.
 */
inputField.addEventListener('change', function() {
  createAndStoreTodoItem(this.value);
});

clearAll.addEventListener('click', clearAllTodos);

/* We call the function to add the initial elements to the dom */
loadTodos();
