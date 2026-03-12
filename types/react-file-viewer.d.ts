declare module 'react-file-viewer' {
  import React from 'react';
  
  interface FileViewerProps {
    fileType: string;
    filePath: string;
    errorComponent?: React.ComponentType;
    onError?: (e: Error) => void;
    [key: string]: any;
  }
  
  const FileViewer: React.FC<FileViewerProps>;
  export default FileViewer;
}
