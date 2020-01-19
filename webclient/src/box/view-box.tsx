import React from 'react';
import './view-box.css';

import { Box, Image } from "./box";
import { boxService } from '.';
import { Dialog } from '../support';
import { Uploader } from '../support/uploader';
import { Map, ZoomLevel } from '../maps';

export type ViewBoxDialogProps = {
  box: Box,
  onClose: Function
}

export type ViewBoxDialogState = {
  // TODO: rename to showAddDialog
  showDialog: boolean,
  startUpload: boolean,
  selectedImage: number
}

export class ViewBoxDialog extends React.Component<ViewBoxDialogProps, ViewBoxDialogState> {
  state: ViewBoxDialogState = {
    showDialog: false,
    selectedImage: 0,
    startUpload: false,
  }

  onUploadDone = (box: Box) => {
    this.setState({showDialog: false})
  }

  render() {
    const { box } = this.props;
    const { showDialog, startUpload, selectedImage } = this.state;

    return (
      <Dialog
        cancelMessage="back to search results"
        headerCss="bg-near-white"
        onClose={this.props.onClose}
      >
        <div className="fl w-100 pv0 ph1 ma0 bg-near-white">
          <div className="fl center w-100 bg-black pa2 pt3">
            {(box.images && box.images.length)
              ? <img src={`https://i.imgur.com/${box.images[selectedImage].id}.jpg`} className="img-view w-100"/>
              : <div className="flex justify-center"><h3 className="white">Select <u>Add</u> below to upload images</h3></div>
            }
          </div>
        
          <div hidden={showDialog} className="fl w-100">
            <div className="flex justify-center bg-black-90 pa3">
              <div className="nowrap overflow-x-auto tr">
                {box.images && box.images.map((image: Image, i: number) => 
                  <img key={image.id} 
                    onClick={() => this.setState({selectedImage: i})} 
                    className="thumbnail" src={`https://i.imgur.com/${image.id}s.jpg`}
                  />  
                )}
              </div>
            
              <div className="pa2">
                <a className="link bg-blue br1 dim ba0 f6 pv1 ph3 white" 
                  onClick={() => this.setState({showDialog: true})}>Add</a>
              </div>
            </div>
          </div>

          {(showDialog && box.id) && 
          <div className="fl w-100 bg-black-90 pa3">        
            <Uploader 
              boxId={box.id} 
              startUpload={startUpload} 
              onUploadEnd={() => this.onUploadDone(box)}
            />
            <div className="fr">
              <a className="link bg-gray br1 dim ba0 f6 pv1 ph3 white mr3" onClick={()=> this.setState({showDialog: false})}>Cancel</a>
              <a className="link bg-blue br1 dim ba0 f6 pv1 ph3 white" onClick={()=> this.setState({startUpload: true})}>Done</a>
            </div>
          </div>
          }
        
          <div className="fl w-100 mb0">
            {box.description}
          </div>

          <div className="fl w-100 mt4 mb0">
            Located near: <a href={`https://www.google.com/maps/search/?api=1&query=${box.geolocation.lng},${box.geolocation.lat}`} target="new">{box.address}</a><br/>
            <small>({box.geolocation.lat}, {box.geolocation.lng})</small>
          </div>
          
          <div className="fl w-100 mt0">          
            <Map 
              id="view" 
              geolocation={box.geolocation}
              zoom={ZoomLevel.Street}
              markers={[{geolocation: box.geolocation}]} 
            />
          </div>
        </div>
      </Dialog>
    )
  }
}