import React from 'react';
import './uploader.css';

import { UploadItem, UploadStatus } from './types';
import { UploadItemPreview } from './upload-item-preview';
import { noOp } from '../helpers';

type UploaderProps = {
  maxFiles?: number;
  boxId?: string;
  startUpload: boolean;
  onUploadBegin?: (uploadItems: UploadItem[]) => void;
  onUploadEnd?: (uploadItems: UploadItem[]) => void;
  onUploadError?: (err: string) => void;
}

type UploaderState = {
  uploadItems: UploadItem[];
  fileList?: FileList;
}

const upload = (item: UploadItem, boxId: string): Promise<Response> => {
  const formData = new FormData();
  formData.append('image', item.file);
  formData.append('album', 'dSygp44');
  formData.append('name', `${boxId}_1`);

  return fetch('/services/upload', {
    method: 'POST',
    body: formData
  });
}

export class Uploader extends React.Component<UploaderProps, UploaderState> { 

  static defaultProps = {
    maxFiles: 4,
    startUpload: false,
    onUploadBegin: noOp,
    onUploadEnd: noOp,
    onUploadError: noOp
  }

  state: UploaderState = {
    uploadItems: [],
  }

  updateUploadItemStatus = (itemId: number, status: UploadStatus) => {
    this.setState(state => ({
      uploadItems: state.uploadItems.map(item => {
        return item.id === itemId
          ? {...item, status}
          : item
        })}));
  }

  onFileListChange = (fileList: FileList) => {
    this.setState({uploadItems: 
      Array.from(fileList)
        .filter((file, i) => i < Math.min(this.props.maxFiles!, fileList.length))
        .map((file, i) => ({
          id: i,
          status: UploadStatus.WAITING,
          file: file
        }))
    });
  }

  uploadAllItems = (boxId: string, id: number, uploadItems: UploadItem[]) => {
    const {onUploadBegin, onUploadEnd, onUploadError} = this.props;
    
    if (id == 0) {
      onUploadBegin!(uploadItems);
    }

    if (id < uploadItems.length) {
      this.updateUploadItemStatus(id, UploadStatus.BEGIN);
      upload(uploadItems[id], boxId)
        .then(resp => {
          this.updateUploadItemStatus(id, UploadStatus.END);
          this.uploadAllItems(boxId, id+1, uploadItems);
        })
        .catch(err => onUploadError!(err))
    } else {
      onUploadEnd!(uploadItems);
    }
  }

  componentDidUpdate(prevProps: UploaderProps) {
    const {boxId, startUpload} = this.props;
    if (!prevProps.startUpload && prevProps.startUpload !== startUpload && boxId) {
      this.uploadAllItems(boxId, 0, this.state.uploadItems);
    }  
  }

  render() {
    return <div>
      <label className="fl fw6 gray">
        Photos: <i className="fw3 f6">({this.props.maxFiles} max)</i>
      </label>
    
      <label htmlFor="files" className="link dim dib ml2 f7 pa1 ph2 br2 white button bg-green pointer">
        Select photos
      </label>
      
      <input type="file" id="files" multiple accept="image/*" 
        onChange={(f) => this.onFileListChange(f.target.files as FileList)} 
      />

      <div id="preview" className="cf fl w-100 mt1">
        {this.state.uploadItems && this.state.uploadItems.map((item, i) =>
          <UploadItemPreview 
            {...item}
          />
        )}
      </div>
    </div>;
  }  
}