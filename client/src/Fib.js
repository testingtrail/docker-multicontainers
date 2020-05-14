import React, { Component } from 'react';
import axios from 'axios';

// Fibonacci class, this will be a component
class Fib extends Component {
   // objet with an array, and object and a string
  state = {
    seenIndexes: [],
    values: {},
    index: ''
  };

  // It is called once in the component life cycle and it signals that the component
    // and all its sub-components have rendered properly
  componentDidMount() {
    this.fetchValues();
    this.fetchIndexes();
  }

   // method to fetch the values
    // the '/api/values/current' is part of the express server as a handler for redis
  async fetchValues() {
    const values = await axios.get('/api/values/current');
    this.setState({ values: values.data });
  }

  // method for indexes that has been indexed
    // the '/api/values/all' is part of the express server as a handler for postgres

    async fetchIndexes() {
      const seenIndexes = await axios.get('/api/values/all');
      this.setState({
        seenIndexes: seenIndexes.data
      });
    }

  // method to handle each time the form is submitted
    // assigning an anonymous function to handleSubmit to make it a function
  handleSubmit = async event => {
    event.preventDefault();
//making a post after the post to send an object
    await axios.post('/api/values', {
      index: this.state.index
    });
    //clear the index value after submitting
    this.setState({ index: '' });
  };

  //method to render indexes
  renderSeenIndexes() {
    return this.state.seenIndexes.map(({ number }) => number).join(', ');
  }

  renderValues() {
    // remember values here are object as that is what Redis is gonng return
        // os it will have many key:value pairs
    const entries = [];

    for (let key in this.state.values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {this.state.values[key]}
        </div>
      );
    }

    return entries;
  }

   // the method to render on screen
  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter your index:</label>
          <input
            value={this.state.index}
            onChange={event => this.setState({ index: event.target.value })}
          />
          <button>Submit</button>
        </form>

        <h3>Indexes I have seen:</h3>
        {this.renderSeenIndexes()}

        <h3>Calculated Values:</h3>
        {this.renderValues()}
      </div>
    );
  }
}


export default Fib;
