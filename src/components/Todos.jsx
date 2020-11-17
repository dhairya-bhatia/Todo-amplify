import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { AmplifySignOut } from '@aws-amplify/ui-react';
import { onAuthUIStateChange } from '@aws-amplify/ui-components'
import { createTodo, deleteTodo, updateTodo } from '../graphql/mutations'
import { sortByDate } from '../graphql/queries'

import awsExports from "../aws-exports";
Amplify.configure(awsExports);

const Todos = () => {

    const [todoList, setTodoList] = useState([]);
    const [ownerId, setOwnerId] = useState('');
    // eslint-disable-next-line 
    const [AuthState, setAuthState] = useState();


    useEffect(() => {
        return onAuthUIStateChange((nextAuthState, authData) => {
            if (nextAuthState === 'signedin') {
                setOwnerId(authData.attributes.sub);
                fetchTodoAndSetTodos(authData.attributes.sub);
            }
            setAuthState(nextAuthState);

        });
        // eslint-disable-next-line 
    }, []);




    async function fetchTodoAndSetTodos(id = ownerId) {

        let input = {
            ownerId: id,
            sortDirection: "ASC"
        }
        const todoData = await API.graphql(graphqlOperation(sortByDate, input))
        const allTodos = todoData.data.sortByDate.items;
        setTodoList(allTodos);
    }



    async function addTodo(todoValue) {
        try {
            if (todoValue !== "") {
                todoList.push(todoValue)
                setTodoList(todoList);
                let input = {
                    name: todoValue,
                    isCompleted: false,
                    ownerId,
                    createdAt: new Date()
                }
                await API.graphql(graphqlOperation(createTodo, { input }));
                fetchTodoAndSetTodos();
            }
        } catch (err) {
            console.log(err);
        }
    };

    async function removeTodo(todoId) {
        try {
            let input = {
                id: todoId
            }
            await API.graphql(graphqlOperation(deleteTodo, { input }));
            fetchTodoAndSetTodos();
        } catch (err) {
            console.log(err);
        }
    };

    async function toggleTodo(todoId, isCompleted) {
        let input = {
            id: todoId,
            isCompleted: !isCompleted
        }
        await API.graphql(graphqlOperation(updateTodo, { input }))
        fetchTodoAndSetTodos()
    }

    const handleAuthStateChange = (state) => {
        let emptyTodos = []
        setTodoList(emptyTodos);

    }


    return (
        <div className="todo-app-container">
            <AmplifySignOut handleAuthStateChange={handleAuthStateChange} slot="sign-out" />
            <h1 className="title"> My Todo List </h1>

            <div className="inputBox-container">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        let newItem = event.target.children[0].value
                        addTodo(newItem);
                        document.getElementsByClassName('input-todo')[0].value = "";
                    }}
                >
                    <input
                        type="text"
                        placeholder="What needs to be done ?"
                        className="input-todo"
                        required
                    />
                </form>
            </div>

            <div className="todo-list-container">
                <ul>
                    {/* Rendering Todo List   */}
                    {todoList.map((todo, index) => {
                        return (
                            <li key={index}>
                                <input
                                    type="checkbox"
                                    checked={todo.isCompleted}
                                    onChange={() => toggleTodo(todo.id, todo.isCompleted)}
                                />

                                {todo.name}

                                <button
                                    className="delete-item"
                                    onClick={() => removeTodo(todo.id)}
                                >
                                    Delete
                    </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

        </div>
    );
}

export default Todos;