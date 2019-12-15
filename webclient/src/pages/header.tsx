import React from 'react';

export const Header: React.FC = (props) => (
  <header className="fl cf w-100 pv2 ph1 ph3-m ph6-l bg-black" id="header">
    <div className="fl dib w-10 nowrap">
      {/* <i className="material-icons md-large red v-mid mb2">apps</i> */}
      <span className="f4 fw6 f3-l white v-mid">ubart</span>
    </div>
    <form className="fl w-90 nowrap tr" id="search-n-add-form">
      <input type="text" id="term-or-url-input" className=" w-70-l w-60-m w-50 pa1 pa2-m pa2-l bw0 br1 bg-washed-yellow" placeholder="Enter a location" tabIndex={1} />
      <div className="dib nowrap">
        <button id="add-page-btn" type="button" className="pv1 pv2-m pv2-l ph1 ph3-l ml1 br1 pointer bg-yellow dim f6 f5-ns fw3 fw6-l black bw0" tabIndex={3}>Add Box</button>  
      </div>
    </form>
  </header>
);