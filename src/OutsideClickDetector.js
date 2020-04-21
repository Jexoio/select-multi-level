import React, { PureComponent } from 'react';

class OutsideClickDetector extends PureComponent {
  constructor(props) {
    super(props);
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.clickOutsideHandler = this.clickOutsideHandler.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.clickOutsideHandler);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.clickOutsideHandler);
  }

  // Set the wrapper ref
  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  // Notify if clicked on outside of element
  clickOutsideHandler(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      if (this.props.onOutside) {
        this.props.onOutside(event);
      }
    }
  }

  render() {
    return <div ref={this.setWrapperRef}>{this.props.children}</div>;
  }
}

export default OutsideClickDetector;