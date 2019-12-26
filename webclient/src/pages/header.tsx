import React from 'react';
import { RouterProps } from '../support';
import { SearchBox } from '../maps';

type HeaderProps = RouterProps & {}

const showAddBoxDialog = ({history, location}: HeaderProps) => {
  history.push(`/add${location.search}`);
}

export const Header: React.FC<HeaderProps> = (props: HeaderProps) => (
  <header className="fl cf w-100 pv2 ph1 ph3-m ph6-l bg-black" id="header">
    <div className="fl dib w-10 nowrap">
      {/* <i className="material-icons md-large red v-mid mb2">apps</i> */}
      <span className="f4 fw6 f3-l white v-mid">ubart</span>
    </div>
    <form className="fl w-90 nowrap tr" id="search-n-add-form">
      <div className="fr dib nowrap">
        <button id="add-page-btn" type="button" 
          onClick={() => showAddBoxDialog(props)}
          className="pv1 pv2-m pv2-l ph1 ph3-l ml1 br1 pointer bg-yellow dim f6 f5-ns fw3 fw6-l black bw0" 
          tabIndex={3}>Add Box
        </button>  
      </div>
      <SearchBox id="main" 
        css="w-100 pa1 pa2-m pa2-l bw0 br1 bg-washed-yellow"
        handler={(geo) => props.history.push(`/?geo=${geo.lat},${geo.lng}`)}
      />
    </form>
  </header>
);