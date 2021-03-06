import React from 'react';
import ReactDOM from 'react-dom';
import ReactAutocomplete from 'ron-react-autocomplete';
import { Column } from 'common/prop-shapes';
import '../../../../themes/ron-react-autocomplete.css';
import PropTypes from 'prop-types';

const optionPropType = PropTypes.shape({
  id: PropTypes.required,
  title: PropTypes.string
});

class AutoCompleteEditor extends React.Component {
  static propTypes = {
    onCommit: PropTypes.func,
    options: PropTypes.arrayOf(optionPropType),
    label: PropTypes.any,
    value: PropTypes.any,
    height: PropTypes.number,
    valueParams: PropTypes.arrayOf(PropTypes.string),
    column: PropTypes.shape(Column),
    resultIdentifier: PropTypes.string,
    search: PropTypes.string,
    onKeyDown: PropTypes.func,
    onFocus: PropTypes.func,
    editorDisplayValue: PropTypes.func
  };

  static defaultProps = {
    resultIdentifier: 'id'
  };

  handleChange = () => {
    this.props.onCommit();
  };

  getValue = () => {
    let value;
    const updated = {};
    if (this.hasResults() && this.isFocusedOnSuggestion()) {
      value = this.getLabel(this.autoComplete.state.focusedValue);
      if (this.props.valueParams) {
        value = this.constuctValueFromParams(this.autoComplete.state.focusedValue, this.props.valueParams);
      }
    } else {
      value = this.autoComplete.state.searchTerm;
    }

    updated[this.props.column.key] = value;
    return updated;
  };

  getEditorDisplayValue = () => {
    const displayValue = { title: '' };
    const { column, value, editorDisplayValue } = this.props;
    if (editorDisplayValue && typeof editorDisplayValue === 'function') {
      displayValue.title = editorDisplayValue(column, value);
    } else {
      displayValue.title = value;
    }
    return displayValue;
  };

  getInputNode = () => {
    return ReactDOM.findDOMNode(this).getElementsByTagName('input')[0];
  };

  getLabel = (item) => {
    const label = this.props.label != null ? this.props.label : 'title';
    if (typeof label === 'function') {
      return label(item);
    } else if (typeof label === 'string') {
      return item[label];
    }
  };

  hasResults = () => {
    return this.autoComplete.state.results.length > 0;
  };

  isFocusedOnSuggestion = () => {
    const autoComplete = this.autoComplete;
    return autoComplete.state.focusedValue != null;
  };

  constuctValueFromParams = (obj, props) => {
    if (!props) {
      return '';
    }

    const ret = [];
    for (let i = 0, ii = props.length; i < ii; i++) {
      ret.push(obj[props[i]]);
    }
    return ret.join('|');
  };

  setAutocompleteRef = (autoComplete) => {
    this.autoComplete = autoComplete;
  };

  render() {
    const label = this.props.label != null ? this.props.label : 'title';
    return (<div height={this.props.height} onKeyDown={this.props.onKeyDown}>
      <ReactAutocomplete search={this.props.search} ref={this.setAutocompleteRef} label={label} onChange={this.handleChange} onFocus={this.props.onFocus} resultIdentifier={this.props.resultIdentifier} options={this.props.options} value={this.getEditorDisplayValue()} />
      </div>);
  }
}

export default AutoCompleteEditor;
