import React from 'react';
import './styles/app.css';
import { bmiReferenceProps, headCircumferenceReferenceProps } from './data.js';

class App extends React.Component {
  state = { fields: [], formName: '', type: 1, error: ''}; // type 1 for BMI, 2 for head

  handleSubmit = event => {
    event.preventDefault();

    // check if ready to submit
    let requiredFields = this.state.fields.filter(field => field.isRequired);
    let errorField = this.state.fields.filter(field => field.error);
    let emptyField = requiredFields.filter(field => !field.value);
    if (errorField.length) {
      this.setState({error: 'There are validation errors'});
    } else if (emptyField.length) {
      this.setState({error: 'There are not completed fields'});
    } else {
      this.setState({error: ''});
      let output = {};
      this.state.fields.forEach(field => {
        output[field.id] = field.value;
      });
      console.log(output);
    }
  }

  // set field value, check for errors and calculate BMI
  onFieldChange(id, event) {
    let fields = [...this.state.fields];
    let bmiField  = null;
    let heightField = null;
    let weightField = null;
    fields.forEach(field => {
      if (field.id === id) {
        field.value = event.target.value;
        if (id === 'name') {
          let name = field.value.split(' ');
          if (name.length == 2 && name[0] && name[1])
            field.error = '';
          else
            field.error = 'Name should be first and last name separated by a space';
        } else if (field.type === 'numberInput') {
          if (isNaN(field.value))
            field.error = 'Must be a number';
          else {
            field.error = '';
            if (field.bounds) {
              if (field.bounds.upperLimit && field.value > field.bounds.upperLimit)
                field.error = `must be a number below ${field.bounds.upperLimit}`;
              if (field.value <= 0)
                field.error = 'must be a number above 0';
            }
          }
        }
      }

      if ((field.type === 'numberInput' || field.type === 'select') && !field.error && field.value)
        field.value = Number(field.value);

      if (field.id === 'height')
        heightField = field;
      if (field.id === 'weight')
        weightField = field;
      if (field.id === 'bmi') {
        bmiField = field;
      }
    });

    if (this.state.type === 1 && bmiField) {
      if (heightField && weightField && !heightField.error && !weightField.error && heightField.value > 0 && weightField.value > 0) {
        bmiField.value = Number((weightField.value / (heightField.value / 100) ** 2).toFixed(2));
        bmiField.error = '';
        if (bmiField.value > bmiField.bounds.upperLimit)
          bmiField.error = `must be a number below ${bmiField.bounds.upperLimit}`;
        if (bmiField.value <= 0 && typeof bmiField.value !== 'string')
          bmiField.error = 'must be a number above 0';
      }
      else
        bmiField.value = '';
    }

    this.setState({fields});
  }

  renderFields() {
    let fields = this.state.fields;
    if (fields.length) {
      return fields.map(field => {
        let label = <label key={`${field.id}-label`} htmlFor={field.name}>{field.displayName}{field.unitOfMeasure? `(${field.unitOfMeasure})` : ''}</label>;
        if (field.display) {
          switch(field.type) {
            case 'textInput':
            case 'numberInput':
             return (
               <div className="formRow" key={`${field.id}`}>
                 {label}
                 <input type="text" name={field.id} value={field.value} onChange={() => this.onFieldChange(field.id, event)} />
                 {field.isRequired && <span className="isRequired">*</span>}
                 {field.error && <span className="errorMessage">{field.error}</span>}
               </div>
             );
             break;
           case 'select':
             if (field.options && Array.isArray(field.options)) {
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

              if (!field.value)
                field.value = defaultValue;

                return (
                 <div className="formRow" key={`${field.id}`}>
                   {label}
                   <select name={field.id} value={field.value} onChange={() => this.onFieldChange(field.id, event)}>
                     {options}
                   </select>
                   {field.isRequired && <span className="isRequired">*</span>}
                 </div>
               );
             } else {
               return (
                 <div className="formRow" key={`${field.id}`}>
                   {label}
                   <span>Can't render this field, missing option data</span>
                  </div>
               );
             }

             break;
           default:
             return (
               <div className="formRow" key={`${field.id}`}>
                 {label}
                 <span>Can't render this field</span>
                </div>
             );
          }
        } else {
          return (
            <div className="formRow" key={`${field.id}`}>
              {label}
              <span>{field.value}</span>
              {field.isRequired && <span className="isRequired">*</span>}
              {field.error && <span className="errorMessage">{field.error}</span>}
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
    let formName = data.observationName;
    if (data.dataElements && Array.isArray(data.dataElements)) {
      data.dataElements.forEach(element => {
        fields.push({...element, value: '', error: ''});
      });
    }
    this.setState({fields, formName});
  }

  componentDidMount() {
    this.setFields(1);
  }

  changeType(type) {
    this.setFields(type);
    this.setState({type: type, error: ''});
  }

  render() {
    return (
      <div>
        <button className={this.state.type == 1? 'current' : ''} onClick={() => this.changeType(1)}>BMI Form</button>
        <button className={this.state.type == 2? 'current' : ''}  onClick={() => this.changeType(2)}>Head Circumference Form</button>
        <p>{this.state.formName}</p>
        <form onSubmit={this.handleSubmit}>
          {this.renderFields()}
          <input type="submit" value="Submit" /><span className="errorMessage">{this.state.error}</span>
        </form>
      </div>
    );
  }
}

export default App;
