import React from 'react';
import './dialog.css';


export type DialogProps = {
  cancelMessage: string,
  css?: string,
  headerCss?: string,
  onClose: Function
}

export class Dialog extends React.Component<DialogProps> {
  render() {
    const { css='', headerCss=''} = this.props;
    return <div className="dialog">
      <main className={`ph3-m ph6-ns ${css}`}>
        <header className={`fl w-100 ${headerCss} pt1 pb3`}>
          <a className="link dark-blue pointer f6 dim ml1" onClick={() => this.props.onClose()}>&lt; {this.props.cancelMessage}</a>
        </header>
        {this.props.children}
      </main>
    </div>
  }
}