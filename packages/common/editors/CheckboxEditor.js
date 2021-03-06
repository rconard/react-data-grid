import React from 'react';
import PropTypes from 'prop-types';
import '../../../themes/react-data-grid-checkbox.css';

class CheckboxEditor extends React.Component {
  static propTypes = {
    value: PropTypes.bool,
    rowIdx: PropTypes.number,
    column: PropTypes.shape({
      key: PropTypes.string,
      onCellChange: PropTypes.func
    }),
    dependentValues: PropTypes.object
  };

  handleChange = (e) => {
    this.props.column.onCellChange(this.props.rowIdx, this.props.column.key, this.props.dependentValues, e);
  };

  render() {
    const checked = this.props.value != null ? this.props.value : false;
    const checkboxName = 'checkbox' + this.props.rowIdx;
    return (
      <div className="react-grid-checkbox-container checkbox-align" onClick={this.handleChange}>
          <input className="react-grid-checkbox" type="checkbox" name={checkboxName} checked={checked} />
          <label htmlFor={checkboxName} className="react-grid-checkbox-label"></label>
      </div>);
  }
}

export default CheckboxEditor;
