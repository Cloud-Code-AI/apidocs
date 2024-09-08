import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
}

function App() {
  const [greeting, setGreeting] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Example of GET request
    axios.get('http://api.example.com/api/greet')
      .then(response => setGreeting(response.data.greeting))
      .catch(error => console.error('Error fetching greeting:', error));

    // Example of GET request with path parameter
    axios.get('http://api.example.com/api/users/1')
      .then(response => setUser(response.data))
      .catch(error => console.error('Error fetching user:', error));
  }, []);

  const handleCalculate = () => {
    // Example of POST request
    axios.post('http://api.example.com/api/calculate', {
      operation: 'add',
      x: 5,
      y: 3
    })
      .then(response => console.log('Calculation result:', response.data.result))
      .catch(error => console.error('Error calculating:', error));
  };

  return (
    <div>
      <h1>{greeting}</h1>
      {user && (
        <div>
          <h2>User Info</h2>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
        </div>
      )}
      <button onClick={handleCalculate}>Calculate</button>
    </div>
  );
}

export default App;