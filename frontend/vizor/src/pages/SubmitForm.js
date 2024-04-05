import React, { useState } from 'react';
import { firestore } from '../firebaseconfig';
import { addDoc, collection, query, getDocs, where, Timestamp } from 'firebase/firestore';

function SubmitForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [host, setHost] = useState('');
    const [port, setPort] = useState('');
    const [database, setDatabase] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            username,
            password,
            host,
            port,
            database,
        };

        const response = await fetch('http://localhost:8080/api/database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error('Failed to connect to database');
        }

        const data = await response.json();
        // console.log(data);
        alert('Database connection successful!');
        addNewLoginData(formData);
        window.location.href = '/home';
    };

    const handleSearch = async (searchTerm) => {
        const q = query(collection(firestore, 'loginData'), where('username', '>=', searchTerm));
        const querySnapshot = await getDocs(q);
        const results = [];
        querySnapshot.forEach((doc) => {
            results.push(doc.data().username);
        });

        setSearchResults(results);
    };
    
    const handleUsernameSelect = async (selectedUsername) => {
        setUsername(selectedUsername);

        const q = query(collection(firestore, 'loginData'), where('username', '==', selectedUsername));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            setPassword(data.password);
            setHost(data.host);
            setPort(data.port);
            setDatabase(data.database);
        });
    };

    const addNewLoginData = async (formData) => {

        const loginDataQuery = query(
            collection(firestore, 'loginData'),
            where('username', '==', formData.username),
            where('host', '==', formData.host),
            where('port', '==', formData.port),
            where('database', '==', formData.database)
        );
    
        const querySnapshot = await getDocs(loginDataQuery);
    
        if (querySnapshot.size === 0) {

            const db = collection(firestore, 'loginData');
    
            await addDoc(db, {
                username: formData.username,
                host: formData.host,
                port: formData.port,
                database: formData.database,
                timestamp: Timestamp.now(),
            });
        } else {
            // console.log('Login data already exists');
        }
    };

    return (
        <div className='container'>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label style={{paddingRight: "10px", marginBottom: "5px"}}>Username:</label>
                    <input type="text" value={username} onChange={(e) => {
                        setUsername(e.target.value);
                        handleSearch(e.target.value);
                    }} />
                    <ul>
                        {searchResults.map((result, index) => (
                            <li key={index} onClick={() => handleUsernameSelect(result)}>
                                {result}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="form-group">
                    <label style={{paddingRight: "10px", marginBottom: "5px"}}>Password:</label>
                    <input type="password" value={password} onChange={(e) => {
                        setPassword(e.target.value);
                        handleSearch(e.target.value);
                     }} />
                </div>

                <div className="form-group">
                    <label style={{paddingRight: "10px", marginBottom: "5px"}}>Host:</label>
                    <input type="text" value={host} onChange={(e) => {
                        setHost(e.target.value);
                        handleSearch(e.target.value);
                     }} />
                </div>

                <div className="form-group">
                    <label style={{paddingRight: "10px", marginBottom: "5px"}}>Port:</label>
                    <input type="text" value={port} onChange={(e) => {
                        setPort(e.target.value);
                        handleSearch(e.target.value);
                     }} />
                </div>

                <div className="form-group" style={{paddingBottom: "20px"}}>
                    <label style={{paddingRight: "10px", marginBottom: "5px"}}>Database Name:</label>
                    <input type="text" value={database} onChange={(e) => {
                        setDatabase(e.target.value);
                        handleSearch(e.target.value);
                    }} />
                </div>

                <button className="btn" type="submit">Submit</button>
            </form>
        </div>
    );
}

export default SubmitForm;