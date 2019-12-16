import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { Geolocation } from './geolocation';
import { RouterProps, parseQueryString, getUserGeolocation } from './support';
import { Footer, Header, Home } from './pages';

type AppProps = RouterProps & {}

type AppState = {
  geolocation?: Geolocation
}

/**
 * Parse given string for a lat and lng values that make up a Geolocation.
 * @param latLngString "lat,lng" string
 * @returns Geolocation or undefined if not lat/lng values were found.
 */
const parseStringForGeolocation = (latLngString: string): Geolocation | undefined => {
  const [lat, lng] = (latLngString || '').split(',')
    .filter(s => s.trim())
    .map(s => Number(s))
    .filter(n => !isNaN(n));

  if (!lat || lat < -90 || lat > 90 
      || !lng || lng < -180 && lng > 180) {
    return;
  }
  return {lat, lng};
}

export class App extends React.Component<AppProps, AppState> {

  state: AppState = {}

  setGeolocation = (geolocation: Geolocation) => this.setState({geolocation});

  /* 
   * Called when a location change has occurred (or set for the first time),
   * indicating that the geolocation has also changed. Try to parse it out
   * of the query string. If the query string did not have a valid geolocation,
   * try to get it from the browsers geolocation sensor as a backup. 
   */
  onPropsLocationChange = ({location, history}: AppProps) => {
    const params = parseQueryString(location.search);
    const geolocation = parseStringForGeolocation(params.geo);
    if (params.geo && geolocation) {
      this.setGeolocation(geolocation);
    } else {
      getUserGeolocation().then(({lat, lng}) => history.push(`?geo=${lat},${lng}`));
    }
  }

  componentDidMount() {
    /* 
     * On initial load we know geolocation has never been set, try to 
     * force setting it now. 
     */
    this.onPropsLocationChange(this.props);
  }

  componentDidUpdate(prevProps: AppProps) {
    /* Possible geolocation update */
    if (this.props.location.search !== prevProps.location.search) {
      this.onPropsLocationChange(this.props);
    }
  }

  render() {
    return <React.Fragment>
      <Header />
      <Switch>
        <Route path={`/:action?/:boxId?`} render={(props) => 
          <Home {...props} geolocation={this.state.geolocation} />}>
        </Route>  
      </Switch>     
      <Footer />
    </React.Fragment>
  }
}