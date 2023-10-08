import fs from 'fs';
import path from 'path';
import React, { useState } from 'react';
import { ipcRenderer } from 'electron';
import { Series } from 'houdoku-extension-lib';
import { Overlay, SimpleGrid, Title, createStyles } from '@mantine/core';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { IconCheck, IconChevronRight } from '@tabler/icons';
import blankCover from '../../img/blank_cover.png';
import ipcChannels from '../../constants/ipcChannels.json';
import constants from '../../constants/constants.json';
import styles from './LibraryGrid.css';
import {
  categoryListState,
  chapterListState,
  seriesListState,
  seriesState,
} from '../../state/libraryStates';
import {
  chapterLanguagesState,
  confirmRemoveSeriesState,
  libraryColumnsState,
  libraryViewState,
} from '../../state/settingStates';
import { goToSeries, markChapters, removeSeries } from '../../features/library/utils';
import ExtensionImage from '../general/ExtensionImage';
import { LibraryView } from '../../models/types';
import library from '../../services/library';

const thumbnailsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.THUMBNAILS_DIR);
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

const useStyles = createStyles((theme) => ({
  ctxMenuContent: {
    width: 220,
    backgroundColor: theme.colors.dark[6],
    borderRadius: 6,
    overflow: 'hidden',
    padding: 5,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.colors.dark[4],
  },
  ctxSubMenuContent: {
    width: 240,
  },
  ctxMenuItem: {
    backgroundColor: theme.colors.dark[6],
    '&:hover, &[data-highlighted]': {
      backgroundColor: theme.colors.dark[7],
    },
    cursor: 'pointer',
    borderRadius: 3,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    height: 25,
    overflowY: 'hidden',
    position: 'relative',
    paddingLeft: 25,
    paddingRight: 5,
    userSelect: 'none',
    outline: 'none',
  },
  ctxMenuItemIndicator: {
    position: 'absolute',
    left: 0,
    width: 25,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

type Props = {
  getFilteredList: () => Series[];
  showRemoveModal: (series: Series) => void;
};

const LibraryGrid: React.FC<Props> = (props: Props) => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const setSeriesList = useSetRecoilState(seriesListState);
  const setSeries = useSetRecoilState(seriesState);
  const setChapterList = useSetRecoilState(chapterListState);
  const availableCategories = useRecoilValue(categoryListState);
  const libraryView = useRecoilValue(libraryViewState);
  const libraryColumns = useRecoilValue(libraryColumnsState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const confirmRemoveSeries = useRecoilValue(confirmRemoveSeriesState);
  const [categoriesSubMenuOpen, setCategoriesSubMenuOpen] = useState(false);

  const viewFunc = (series: Series) => {
    goToSeries(series, setSeriesList, navigate);
  };

  const markAllReadFunc = (series: Series) => {
    if (series.id) {
      const chapters = library.fetchChapters(series.id);
      markChapters(chapters, series, true, setChapterList, setSeries, chapterLanguages);
      setSeriesList(library.fetchSeriesList());
    }
  };

  const removeFunc = (series: Series) => {
    if (confirmRemoveSeries) {
      props.showRemoveModal(series);
    } else {
      removeSeries(series, setSeriesList);
    }
  };

  const handleToggleCategory = (series: Series, categoryId: string) => {
    const categories = series.categories || [];
    let newCategories: string[] = [...categories, categoryId];
    if (categories.includes(categoryId)) {
      newCategories = categories.filter((cat) => cat !== categoryId);
    }

    library.upsertSeries({
      ...series,
      categories: newCategories,
    });
    setSeriesList(library.fetchSeriesList());
  };

  /**
   * Get the cover image source of a series.
   * If the series id is non-undefined (i.e. it is in the user's library) we first try to find the
   * downloaded thumbnail image. If it doesn't exist, we return the blankCover path.
   * @param series
   * @returns the cover image for a series, which can be put in an <img> tag
   */
  const getImageSource = (series: Series) => {
    if (series.id !== undefined) {
      const fileExtensions = constants.IMAGE_EXTENSIONS;
      for (let i = 0; i < fileExtensions.length; i += 1) {
        const thumbnailPath = path.join(thumbnailsDir, `${series.id}.${fileExtensions[i]}`);
        if (fs.existsSync(thumbnailPath)) return thumbnailPath;
      }
      return blankCover;
    }

    return series.remoteCoverUrl === '' ? blankCover : series.remoteCoverUrl;
  };

  /**
   * Render the "Unread" badge on a series.
   * This is a number in a red box at the top-left of the cover, showing the number of unread
   * chapters. This is based on series.numberUnread, which is a fairly naive value obtained by
   * subtracting the highest available chapter number by the latest read chapter number (rounded).
   * See comparison.getNumberUnreadChapters for more details.
   * @param series the series to generate the badge for
   * @returns an element to include in the cover container div
   */
  const renderUnreadBadge = (series: Series) => {
    if (series.numberUnread > 0) {
      return (
        <Title
          order={5}
          className={styles.seriesUnreadBadge}
          sx={(theme) => ({ backgroundColor: theme.colors.red[7] })}
          px={4}
          style={{ zIndex: 10 }}
        >
          {series.numberUnread}
        </Title>
      );
    }
    return <></>;
  };

  return (
    <>
      <SimpleGrid cols={libraryColumns} spacing="xs">
        {props.getFilteredList().map((series: Series) => {
          const coverSource = getImageSource(series).replaceAll('\\', '/');

          return (
            <ContextMenu.Root key={`${series.id}-${series.title}`}>
              <ContextMenu.Trigger className={styles.ContextMenuTrigger}>
                <div>
                  <div
                    className={styles.coverContainer}
                    onClick={() => viewFunc(series)}
                    // style={{
                      // height: `calc(105vw / ${libraryColumns})`,
                    // }}
                  >
                    <ExtensionImage
                      url={coverSource}
                      series={series}
                      alt={series.title}
                      // width="100%"
                      // height="100%"
                      style={{
						  objectFit: 'cover',
						  width: '100%',
						  height: '100%'
						  // maxWidth: '100%',
						  // maxHeight: '100%'						  
					    }}
                    />
                    {renderUnreadBadge(series)}
                    {libraryView === LibraryView.GridCompact ? (
                      <>
                        <Title
                          className={styles.seriesTitle}
                          order={5}
                          lineClamp={3}
                          p={4}
                          style={{ zIndex: 10 }}
                        >
                          {series.title}
                        </Title>
                        <Overlay
                          gradient="linear-gradient(0deg, #000000cc, #00000000 40%, #00000000)"
                          zIndex={5}
                        />
                      </>
                    ) : (
                      ''
                    )}
                  </div>
                  {libraryView === LibraryView.GridComfortable ? (
                    <Title order={5} lineClamp={3} p={4}>
                      {series.title}
                    </Title>
                  ) : (
                    ''
                  )}
                </div>
              </ContextMenu.Trigger>
              <ContextMenu.Portal>
                <ContextMenu.Content className={classes.ctxMenuContent}>
                  <ContextMenu.Item
                    className={classes.ctxMenuItem}
                    onClick={() => viewFunc(series)}
                  >
                    View
                  </ContextMenu.Item>
                  <ContextMenu.Item
                    className={classes.ctxMenuItem}
                    onClick={() => markAllReadFunc(series)}
                  >
                    Mark all Read
                  </ContextMenu.Item>
                  <ContextMenu.Item
                    className={classes.ctxMenuItem}
                    onClick={() => removeFunc(series)}
                  >
                    Remove
                  </ContextMenu.Item>
                  <ContextMenu.Sub open={categoriesSubMenuOpen}>
                    <ContextMenu.SubTrigger
                      className={classes.ctxMenuItem}
                      onPointerEnter={() => setCategoriesSubMenuOpen(true)}
                      onPointerLeave={() => setCategoriesSubMenuOpen(false)}
                    >
                      Categories
                      <div style={{ marginLeft: 'auto' }}>
                        <IconChevronRight />
                      </div>
                    </ContextMenu.SubTrigger>
                    <ContextMenu.Portal>
                      <ContextMenu.SubContent
                        className={`${classes.ctxMenuContent} ${classes.ctxSubMenuContent}`}
                        sideOffset={2}
                        alignOffset={-5}
                        onPointerEnter={() => setCategoriesSubMenuOpen(true)}
                        onPointerLeave={() => setCategoriesSubMenuOpen(false)}
                      >
                        {availableCategories.map((category) => {
                          return (
                            <ContextMenu.CheckboxItem
                              key={category.id}
                              className={classes.ctxMenuItem}
                              checked={series.categories && series.categories.includes(category.id)}
                              onCheckedChange={() => {
                                handleToggleCategory(series, category.id);
                                setCategoriesSubMenuOpen(false);
                              }}
                            >
                              <ContextMenu.ItemIndicator className={classes.ctxMenuItemIndicator}>
                                <IconCheck width={18} height={18} />
                              </ContextMenu.ItemIndicator>
                              {category.label}
                            </ContextMenu.CheckboxItem>
                          );
                        })}
                      </ContextMenu.SubContent>
                    </ContextMenu.Portal>
                  </ContextMenu.Sub>
                </ContextMenu.Content>
              </ContextMenu.Portal>
            </ContextMenu.Root>
          );
        })}
      </SimpleGrid>
    </>
  );
};

export default LibraryGrid;
