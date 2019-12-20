import React, { useState, useEffect } from 'react';
import { UploadItem, UploadStatus } from './types';


type UploadItemPreviewProps = UploadItem & {}

/* Possible css states the preview layers can have. */
const enum LayerState {
  ENABLED = '',
  DISABLED = 'disabled'
}

export const UploadItemPreview: React.FC<UploadItemPreviewProps> = 
  ({id, 
    status = UploadStatus.WAITING, 
    file
  }) => 
{

  const [layerStates, setLayerStates] = useState<{[key: string]: LayerState}>({
    spinner: LayerState.DISABLED,
    overlay: LayerState.DISABLED,
    done: LayerState.DISABLED  
  });

  useEffect(() => {
    if (status === UploadStatus.BEGIN) {
      setLayerStates({...layerStates, 
        overlay: LayerState.ENABLED,
        spinner: LayerState.ENABLED      
      });
    } else if (status === UploadStatus.END) {
      setLayerStates({...layerStates,
        spinner: LayerState.DISABLED,
        done: LayerState.ENABLED
      });
    }
  }, [id, status]);

  const [fileData, setFileData] = useState<string>();
  useEffect(() => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => setFileData(reader.result as string);
  }, [file]);

  return <div key={id} className="upload-item fl">
    {fileData && <img src={fileData}/> }
    <div id={`overlay-${id}`} className={`overlay ${layerStates.overlay}`}></div>
    <div id={`spinner-${id}`} className={`spinner ${layerStates.spinner}`}></div>
    <div id={`done-${id}`} className={`done ${layerStates.done}`}>&#10004;</div>
  </div>
}
