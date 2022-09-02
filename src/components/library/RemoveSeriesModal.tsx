import React from 'react';
import log from 'electron-log';
import Paragraph from 'antd/lib/typography/Paragraph';
import { Series } from 'houdoku-extension-lib';
import { Checkbox, Form, Modal } from 'antd';
import { useHistory } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { ipcRenderer } from 'electron';
import ipcChannels from '../../constants/ipcChannels.json';
import routes from '../../constants/routes.json';
import { removeSeries } from '../../features/library/utils';
import { seriesListState } from '../../state/libraryStates';
import { customDownloadsDirState } from '../../state/settingStates';
import styles from './RemoveSeriesModal.css';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

type Props = {
  showing: boolean;
  close: () => void;
  series: Series | null;
};

const RemoveSeriesModal: React.FC<Props> = (props: Props) => {
  const history = useHistory();
  const [removalForm] = Form.useForm();
  const setSeriesList = useSetRecoilState(seriesListState);
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);

  return (
    <Modal
      visible={props.showing}
      title="Remove this series from your library?"
      onCancel={props.close}
      okText="Remove"
      okButtonProps={{ danger: true }}
      onOk={() => {
        removalForm
          .validateFields()
          .then((values) => {
            // eslint-disable-next-line promise/always-return
            if (props.series) {
              log.info(`Removing series ${props.series.id}`);
              removeSeries(
                props.series,
                setSeriesList,
                values.deleteDownloads,
                customDownloadsDir || defaultDownloadsDir
              );
              history.push(routes.LIBRARY);
            }
          })
          .catch((info) => {
            log.error(info);
          })
          .finally(props.close)
          .catch((info) => {
            log.error(info);
          });
      }}
    >
      <Form form={removalForm} name="removal_form" initialValues={{ deleteDownloads: false }}>
        <Paragraph>This action is irreversible.</Paragraph>
        <Form.Item className={styles.formItem} name="deleteDownloads" valuePropName="checked">
          <Checkbox>Delete downloaded chapters</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RemoveSeriesModal;
