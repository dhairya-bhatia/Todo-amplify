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
    const [ownerUsername, setOwnerUsername] = useState('');
    // eslint-disable-next-line 
    const [AuthState, setAuthState] = useState();


    useEffect(() => {
        return onAuthUIStateChange((nextAuthState, authData) => {
            if (nextAuthState === 'signedin') {
                setOwnerId(authData.attributes.sub);
                console.log(authData);
                setOwnerUsername(authData.username);
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
        <div className="text-center">
            <AmplifySignOut handleAuthStateChange={handleAuthStateChange} slot="sign-out" />
            <div className="mr-4 text-lg flex flex-col">
                <h4 className="max-w-max self-end bg-blue-200 p-6 float-right"> Hello, {ownerUsername}</h4>
                <h1 className="text-5xl text-gray-600 font-mono py-6"> My Todo List </h1>
            </div>

            <div>
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
                        className="input-todo pl-5 h-16 max-w-xl w-full border-none shadow-md rounded-lg"
                        required
                    />
                </form>
            </div>

            <div className="mt-1">
                <ul className="max-w-xl w-full mx-auto shadow-lg">
                    {/* Rendering Todo List   */}
                    {todoList.map((todo, index) => {
                        return (
                            <li key={index}
                                className="flex justify-between text-left no-underline text-black bg-white leading-8 border-b-solid border-b-2 border-gray-500 p-4 bg-listBg hover:bg-listHoverBg rounded-lg"
                            >
                                <div className="left-content">
                                    <input
                                        type="checkbox"
                                        checked={todo.isCompleted}
                                        onChange={() => toggleTodo(todo.id, todo.isCompleted)}
                                    />

                                    <span className="pl-3 text-lg">{todo.name}</span>
                                </div>
                                <button
                                    className="bg-customOrange text-white uppercase no-underline ml-4 px-4 py-1 rounded-lg hover:bg-red-600"
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