import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import EventTable from './components/EventTable';
import CrewManager from './components/CrewManager';
import OrganizationManager from './components/OrganizationManager';
import RateManager from './components/RateManager';
import SeasonManager from './components/SeasonManager';
import ImportManager from './components/ImportManager';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <Switch>
          <Route exact path="/" component={EventTable} />
          <Route path="/crew" component={CrewManager} />
          <Route path="/organizations" component={OrganizationManager} />
          <Route path="/rates" component={RateManager} />
          <Route path="/seasons" component={SeasonManager} />
          <Route path="/import" component={ImportManager} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
