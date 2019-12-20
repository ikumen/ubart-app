export enum UploadStatus {
  /* Uploaded file selected and waiting for upload. */
  WAITING,
  /* Upload has started. */
  BEGIN,
  /* Upload has finished successfully. */
  END,
  /* There was an error during upload. */
  ERROR
}

export type UploadItem = {
  id: number;
  status?: UploadStatus;
  file: File;
}
