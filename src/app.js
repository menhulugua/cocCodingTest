import React from 'react';
import './styles/app.css';
import './styles/styles.scss';
import img from './images/reactIcon.png'

class App extends React.Component {
  state = { greeting: 'Halou!'}
  render() {
    console.log('from App.js');
    return (
      <div>
        <span>{this.state.greeting}</span>
        <img src={img} />
      </div>
    );
  }
}

export default App;
