import React from 'react';

import { Map, ZoomLevel, Marker } from '../maps';
import { RouterProps, noOp } from '../support';
import { Geolocation } from '../geolocation';
import { AddBoxDialog } from '../box/add-box';
import { Box, boxService } from '../box';
import { ViewBoxDialog } from '../box/view-box';

type HomeState = {
  boxes: Box[],
  dialog: Function,
  markers: Marker[]
}

type HomeProps = RouterProps & {
  geolocation?: Geolocation
}

export class Home extends React.Component<HomeProps, HomeState> {

  state: HomeState = {
    boxes: [],
    dialog: noOp,
    markers: []
  }

  search = (geolocation: Geolocation) => {
    boxService.search(geolocation).then(this.handleSearchResults)
  }

  /* Simulate navigating to /box view by pushing new location. */
  navigateToBox = (box: Box, {history, location}: HomeProps) => {
    history.push(`/box/${box.id}${location.search}`);
  }

  /* Dialog views are based on location state, close a dialog simple takes us back to home path. */
  closeDialog = () => {
    this.props.history.push(`/${this.props.location.search}`);
  }

  updateGeolocation = (geolocation: Geolocation) => {
    this.props.history.push(`/?geo=${geolocation.lat},${geolocation.lng}`);
  }

  createMarker = (box: Box): Marker => ({
    geolocation: box.geolocation,
    data: box,
    /* Each marker represents a box, so clicking on it should take us to the box view */
    onClick: (geolocation, m) => this.navigateToBox(m.data, this.props)
  })

  handleSearchResults = (boxes: Box[]) => {
    this.setState({
      boxes,
      markers: boxes.map(this.createMarker)
    });
  }

  showAddDialog = () => {
    this.setState({
      dialog: () => <AddBoxDialog {...this.props} onClose={this.closeDialog} />
    });
  }

  showViewDialog = (boxId: string) => {
    boxService.get(boxId).then(box => this.setState({
      dialog: () => <ViewBoxDialog box={box} onClose={this.closeDialog} />
    }));
  }

  handleAction = (action?: string, boxId?: string) => {
    if (action === 'add') {
      this.showAddDialog();
    } else if (action === 'box' && boxId) {
      this.showViewDialog(boxId);
    } else {
      this.setState({dialog: noOp})
    }
  }

  componentDidMount() {
    const {match, geolocation} = this.props;
    const {action, boxId} = match.params;

    if (action) 
      this.handleAction(action, boxId);
      
    if (geolocation) 
      this.search(geolocation);
  }

  componentDidUpdate(prevProps: HomeProps) {
    const {match, geolocation} = this.props;
    const {action, boxId} = match.params;

    if (prevProps.match.params.action !== action)
      this.handleAction(action, boxId);

    if (geolocation && prevProps.geolocation !== geolocation)
      this.search(geolocation);
  }

  render() {
    const { boxes, dialog, markers } = this.state;

    return <main className="fl cf w-100 pv0">
      <Map 
        id="main"
        draggable={true}
        zoom={ZoomLevel.Neighborhood}
        geolocation={this.props.geolocation}
        onDrag={this.updateGeolocation}
        markers={markers}
      />

      { dialog() }
    </main>
  }
}
