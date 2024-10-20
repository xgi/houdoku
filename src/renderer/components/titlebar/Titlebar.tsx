import { titlebarTextState } from '@/renderer/state/libraryStates';
import { useRecoilValue } from 'recoil';
import packageJson from '../../../../package.json';
const { ipcRenderer } = require('electron');
import ipcChannels from '@/common/constants/ipcChannels.json';
import styles from './Titlebar.module.css';

const Titlebar: React.FC = () => {
  const text = useRecoilValue(titlebarTextState);

  const formattedText = text ? `${packageJson.productName} - ${text}` : packageJson.productName;

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <span>{formattedText}</span>
      </div>
      <div className={styles.controls}>
        <div
          className={styles.button}
          id="min-button"
          onClick={() => ipcRenderer.invoke(ipcChannels.WINDOW.MINIMIZE)}
        >
          <svg width="11" height="1" viewBox="0 0 11 1">
            <path d="m11 0v1h-11v-1z" strokeWidth=".26208" />
          </svg>
        </div>
        <div
          className={styles.button}
          id="max-restore-button"
          onClick={() => ipcRenderer.invoke(ipcChannels.WINDOW.MAX_RESTORE)}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path
              d="m10-1.6667e-6v10h-10v-10zm-1.001 1.001h-7.998v7.998h7.998z"
              strokeWidth=".25"
            />
          </svg>
        </div>
        <div
          className={`${styles.button} ${styles.exit}`}
          onClick={() => ipcRenderer.invoke(ipcChannels.WINDOW.CLOSE)}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d="m6.8496 6 5.1504 5.1504-0.84961 0.84961-5.1504-5.1504-5.1504 5.1504-0.84961-0.84961 5.1504-5.1504-5.1504-5.1504 0.84961-0.84961 5.1504 5.1504 5.1504-5.1504 0.84961 0.84961z"
              strokeWidth=".3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
export default Titlebar;

// #titlebar {
//   display: block;
//   position: fixed;
//   top: 0;
//   height: 24px;
//   width: 100%;
//   background: #141414;
//   padding: 2px;
//   z-index: 999;
// }

// #titlebar.hidden {
//   display: none;
// }

// #titlebar #drag-region {
//   width: 100%;
//   height: 100%;
//   -webkit-app-region: drag;
// }

// #window-title {
//   grid-column: 1;
//   display: flex;
//   align-items: center;
//   margin-left: 8px;
//   overflow: hidden;
//   font-family: 'Segoe UI', sans-serif;
//   font-size: 12px;
//   overflow-x: hidden;
// }

// #window-title span {
//   overflow: hidden;
//   text-overflow: ellipsis;
//   white-space: nowrap;
//   line-height: 1.5;
// }

// #window-controls {
//   display: grid;
//   grid-template-columns: repeat(3, 46px);
//   position: absolute;
//   top: 0;
//   right: 0;
//   height: 100%;
// }

// #window-controls .button {
//   grid-row: 1 / span 1;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   width: 100%;
//   height: 100%;
//   fill: var(--color-foreground);
// }

// #min-button {
//   grid-column: 1;
// }

// #max-restore-button {
//   grid-column: 2;
// }

// #close-button {
//   grid-column: 3;
// }

// #window-controls {
//   -webkit-app-region: no-drag;
// }

// #window-controls .button {
//   user-select: none;
// }
