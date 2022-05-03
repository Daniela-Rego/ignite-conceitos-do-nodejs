const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
   const {username} = request.headers; 
  
  const user = users.find( pos => pos.username === username )

  if(!user)
  {
    return response.status(404).json({error: "User not found"});
  }
  request.user = user;
  

  return next();

}

app.post('/users', (request, response) => {
 const {name,username} = request.body;

 const existsUserAccount = users.find(user =>
     user.username === username);

    if ( existsUserAccount) 
    {
        return response.status(400).json({error:'Username already exists!'})
    }

  
 const user = { 
      id: uuidv4(), // precisa ser um uuid
      name,
      username, 
      todos: []
    }
    users.push(user);
    return response.status(201).json(user); 
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const {user} = request;    
    const {title, deadline} = request.body;
        //preciso receber um unico usuario para add tarefas somente nele

       const task = { 
          id: uuidv4(), // precisa ser um uuid
          title,
          done: false, 
          deadline: new Date(deadline), 
          created_at: new Date()
        }
        user.todos.push(task);
        return response.status(201).json(task);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  /*A rota deve receber, pelo header da requisição, uma propriedade `username` contendo o username do usuário 
  e receber as propriedades `title` e `deadline` dentro do corpo. 
  É preciso alterar **apenas** o `title` e o `deadline` da tarefa que possua o `id` igual ao `id` presente nos parâmetros da rota.*/   
  const {user} = request;
    const {title,deadline} = request.body;
    const {id} = request.params;
    const task = user.todos.find( pos=> pos.id === id )
    
    if(!task)
  {
    return response.status(404).json({error: "Todo not found"});
  }

    task.title = title;
    task.deadline = new Date(deadline);
      return response.json(task);
      
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
 
  const task = user.todos.find( pos=> pos.id === id );
  if(!task)
  {
    return response.status(404).json({error: "Todo.done  not found"});
  }
     task.done = true;
  return response.json(task);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const taskIndex = user.todos.findIndex(repository => repository.id === id);
  
  if(taskIndex === -1)
  {
    return response.status(404).json({error: "Todo  not exist"});
  }

  //para deletar uma posição do array
  user.todos.splice(taskIndex, 1);


 // return response.status(204).json(users);
 return response.status(204).json();

});

module.exports = app;