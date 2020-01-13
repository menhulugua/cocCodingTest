import React from 'react';
import './styles/app.css';
import { bmiReferenceProps, headCircumferenceReferenceProps } from './data.js';

class App extends React.Component {
  state = { fields: [], formName: ''};

  handleSubmit = event => {
    event.preventDefault();

    let output = {};
    this.state.fields.forEach(field => {
      output[field.id] = field.value;
    });
    console.log(output);
  }

  onFieldChange(id, event) {
    let fields = [...this.state.fields];
    fields.forEach(field => {
      if (field.id === id)
        field.value = event.target.value;
    });
    this.setState({fields});
  }

  renderFields() {
    let fields = this.state.fields;
    if (fields.length) {
      return fields.map(field => {
        let label = <label key={`${field.id}-label`} htmlFor={field.name}>{field.displayName}</label>;
        if (field.display) {
          switch(field.type) {
            case 'textInput':
            case 'numberInput':
             return (
               <div className="formRow" key={`${field.id}`}>
                 {label}
                 <input type="text" name={field.id} value={field.value} onChange={() => this.onFieldChange(field.id, event)} />
               </div>
             );
             break;
           case 'select':
             let options = field.options.map(option => {
                return (
                  <option key={`${field.name}-${option.id}`} value={option.id}>{option.name}</option>
                );
             });
             let defaultValue = field.options.filter(option => {
               return option.isDefault;
             });
             if (defaultValue.length === 1)
              defaultValue = defaultValue[0].id;
             else
              defaultValue = field.options[0].id;
              return (
               <div className="formRow" key={`${field.id}`}>
                 {label}
                 <select name={field.id} value={field.value? field.value : defaultValue} onChange={() => this.onFieldChange(field.id, event)}>
                   {options}
                 </select>
               </div>
             );
             break;
           default:
             return (
               <div className="formRow" key={`${field.id}`}>
                 {label}
                 <span>Can't render this field</span>
                </div>);
          }
        } else {
          return (
            <div className="formRow" key={`${field.id}`}>
              {label}
              <span>{field.value}</span>
             </div>
          );
        }
      });
      return renderedFields;
    } else {
      return <div>Error fetching field element</div>
    }
  }

  setFields(type = 1) { // type 1 for BMI, 2 for head
    let data = {};
    if (type === 1) {
      data = bmiReferenceProps;
    } else if (type === 2) {
      data = headCircumferenceReferenceProps;
    } else {
      return 0;
    }

    // fetch useful data
    let fields = [];
    data.dataElements.forEach(element => {
      fields.push({...element, value: '', error: ''});
    });
    this.setState({fields: fields});
  }

  componentDidMount() {
    this.setFields(1);
  }

  changeType(type) {
    this.setFields(type);
  }

  render() {
    return (
      <div>
        <button onClick={() => this.changeType(1)}>BMI Form</button>
        <button onClick={() => this.changeType(2)}>Head Circumference Form</button>
        <p>{this.state.formName}</p>
        <form onSubmit={this.handleSubmit}>
          {this.renderFields()}
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

export default App;
