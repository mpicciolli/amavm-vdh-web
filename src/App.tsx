import * as React from 'react';
import './App.css';
import Header from './components/header/Header';
import Map from './components/map/Map';

class App extends React.Component {

  public render() {
    return (
      <div className="App">
        <Header />
        <Map />
      </div>
    );
  }
}

export default App;
