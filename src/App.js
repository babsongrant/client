import React from 'react';
import EventTable from './components/EventTable';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Broadcast Events</h1>
      </header>
      <main>
        <EventTable />
      </main>
    </div>
  );
}

export default App;
