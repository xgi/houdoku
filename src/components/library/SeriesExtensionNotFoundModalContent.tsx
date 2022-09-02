import React from 'react';
import Paragraph from 'antd/lib/typography/Paragraph';
import { Series } from 'houdoku-extension-lib';

type Props = {
  series: Series;
};

const SeriesExtensionNotFoundModalContent: React.FC<Props> = (props: Props) => {
  return (
    <>
      <Paragraph>The extension for this series was not found.</Paragraph>
      <Paragraph>
        To access the series, please reinstall the extension. Or, you may remove it from your
        library now.
      </Paragraph>
      <Paragraph type="secondary">(extension: {props.series.extensionId})</Paragraph>
    </>
  );
};

export default SeriesExtensionNotFoundModalContent;
