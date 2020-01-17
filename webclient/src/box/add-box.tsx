import React from 'react';
import './add-box.css';

import { RouterProps, Dialog } from "../support";
import { Geolocation } from "../geolocation";
import { Marker, Map, ZoomLevel } from "../maps";
import { Uploader } from '../support/uploader';
import { boxService } from '.';

export type AddBoxDialogProps = RouterProps & {
  geolocation?: Geolocation,
  onClose: Function
}

export type AddBoxDialogState = {
  geolocation?: Geolocation,
  description?: string,
  address?: string,
  startAdd: boolean,
  startUpload: boolean,
  startingMarker?: Marker,
  boxId?: string,
  addressLookupId?: number,
}

export class AddBoxDialog 
  extends React.Component<AddBoxDialogProps, AddBoxDialogState> 
{
  state: AddBoxDialogState = {
    startUpload: false,
    startAdd: false
  }

  startAddressLookup = () => {
    const { addressLookupId } = this.state;
    if (addressLookupId) 
      clearTimeout(addressLookupId);
    this.setState({addressLookupId: window.setTimeout(this.lookupAddress, 1000)})
  }

  /**
   * Uses the OpenStreetMap Nomination API to geocode lat/lng to address
   * http://nominatim.org/release-docs/latest/api/Reverse/
   */
  lookupAddress = () => {
    const { geolocation } = this.state;
    if (geolocation) {
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${geolocation.lat}&lon=${geolocation.lng}&format=json`)
        .then(resp => resp.json())
        .then(data => {
          const { house_number='', road='', 
            neighbourhood='', suburb='', 
            city='', county='', state='',
            postcode='', country_code = ''
          } = data.address;

          this.setState({address: `${house_number} ${road} ${road ? '' : neighbourhood + ' ' + suburb} ${city} ${city ? '' : county} ${state} ${postcode} ${country_code.toUpperCase()}`})
        });
    }
  }

  hasErrors = () => {
    if (!this.state.geolocation) {
      alert("Please select a location, by dropping the marker at the target location.");
      return true;
    }
    if (!this.state.description) {
      alert("Please enter a brief description.");
      return true;
    }
    return false;
  }

  addBox = () => {
    if (this.state.startAdd) {
      alert("Hang tight, we're almost done!");
      return;
    }

    if (!this.hasErrors()) {
      this.setState({startAdd: true});
      const { address, geolocation, description } = this.state;
      boxService.create({
        address: address || `${geolocation!.lat}, ${geolocation!.lng}`,
        geolocation: geolocation!,
        description: description
      })
      .then(box => this.setState({
        boxId: box.id,
        startUpload: true
      }))
      // TODO: handle
      .catch(console.error)
    }
  }

  componentDidMount() {
    if (!this.state.startingMarker) {
      this.setState({
        startingMarker: {
          geolocation: this.props.geolocation!,
          onDrag: (geolocation, m) => this.setState({geolocation}),
          onDragEnd: () => this.startAddressLookup()
        }
      });
    }
  }

  onUploadDone = () => {
    setTimeout(() => {
      this.props.history.push(`/?geo=${this.state.geolocation!.lat},${this.state.geolocation!.lng}`)
    }, 1500)
  }

  render() {
    const {
      startingMarker,
      geolocation,
      address,
      startUpload,
      boxId,
      description
    } = this.state;

    return <Dialog
        cancelMessage="back to search results"
        headerCss="bg-near-white"
        onClose={this.props.onClose}>

      <div className="fl w-100 pv0 ph0 ma0 bg-near-white">
        <h3 className="fl black-70 fw5 w-100 pv0 ph2 mv0">
          Help grow the <span className="fw6 f3 link gold">ubart</span> database, submit a box and images.
        </h3>

        <section className="fl w-100 pt3">
          <label className="fw6 gray ph2">Location: 
            <span className="fw4 f6">&nbsp; {address ? address : '' }</span> <br/>
            <span className="fw4 i f6">{geolocation ? `( ${geolocation.lat}, ${geolocation.lng})` : '' }</span> 
          </label>
          <Map
            id="add"
            zoom={ZoomLevel.Neighborhood_S}
            draggable={true}
            geolocation={this.props.geolocation}
            markers={[startingMarker!]}
          />
        </section>

        <section className="fl w-100 pt3 ph2">
          <Uploader
            boxId={boxId}
            startUpload={startUpload}
            onUploadEnd={this.onUploadDone}
          />
        </section>

        <section className="fl w-100 pt3 ph2">
          <label className="fl fw6 w-100 gray">
            Description
          </label>
          <textarea className="mt1 fl w-100 mt1 mh0 pa1 f6" rows={2} 
            name="description" 
            onChange={(e) => this.setState({description: e.target.value})}
            placeholder="e.g, Narly art box at corner ...">{description}
          </textarea>
        </section>

        <section className="fl w-100 tr pt3 white ph2">
          <a className="link bg-gray br1 dim ba0 f6 pv1 ph3 mr3 pointer" onClick={() => this.props.onClose()}>Cancel</a>
          <a className="link bg-blue br1 dim ba0 f6 pv1 ph3 pointer" onClick={() => this.addBox()}>Done</a>
        </section>
      </div>
    </Dialog>
  }
}