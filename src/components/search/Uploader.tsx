import React from 'react';
import path from 'path';

type Props = {
  className: string;
  callback: (path: string) => void;
};

const Uploader: React.FC<Props> = (props: Props) => {
  /**
   * Get the most specific path which contains all of the given files.
   * @param files source files
   * @return the absolute path of the parent directory
   */
  const getRootPath = (files: FileList): string => {
    if (files === null || files.length === 0) return '';

    let curPath: string = files[0].path;
    let foundMatch = false;

    while (!foundMatch) {
      foundMatch = true;
      for (let i = 1; i < files.length; i += 1) {
        const file: File = files[i];

        if (!file.path.startsWith(curPath)) {
          foundMatch = false;
          curPath = path.dirname(curPath);
          break;
        }
      }
    }

    return curPath;
  };

  return (
    <input
      className={props.className}
      type="file"
      webkitdirectory="true"
      onChange={(e) => {
        if (e.target.files !== null)
          props.callback(getRootPath(e.target.files));
      }}
    />
  );
};

export default Uploader;
