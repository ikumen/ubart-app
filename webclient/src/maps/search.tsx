import React from 'react';

import { GeolocationChangedHandler } from './types';
import { mapServiceProviders } from './providers';

type SearchBoxProps = {
  handler: GeolocationChangedHandler,
  id: string,
  css?: string
}

export class SearchBox extends React.Component<SearchBoxProps> {
  
  private autocompleteRef = React.createRef<HTMLInputElement>();

  componentDidMount() {
    const {id, handler} = this.props;
    mapServiceProviders.google.createSearchBox(id, this.autocompleteRef.current!, handler);
  }

  render() {
    return <div id="locationField" className="cf fr w-70-l w-60-m w-50">
      <input type="text" className={`${this.props.css}`} id="autocomplete" ref={this.autocompleteRef} />
    </div>
  }

}