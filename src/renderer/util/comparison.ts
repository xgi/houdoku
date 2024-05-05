/* eslint-disable no-lonely-if */
import { Chapter } from '@tiyo/common';

/**
 * Find a similar chapter from a list.
 * This method attempts to find a chapter within the provided list that matches the original's
 * language and group. If none exist, it attempts to find a chapter that only matches the original
 * language. Otherwise, it returns null.
 * If multiple "best match" chapters in the list, it returns the most recent one.
 * @param original the chapter to compare against
 * @param options the list of chapters to select from
 * @returns the most recent matching chapter in the list, if available, else null
 */
export function selectMostSimilarChapter(original: Chapter, options: Chapter[]): Chapter | null {
  if (options.find((chapter: Chapter) => chapter.id === original.id) !== undefined) {
    return original;
  }

  let matchesBoth: Chapter | null = null;
  let matchesLanguage: Chapter | null = null;

  options.forEach((chapter: Chapter) => {
    if (chapter.languageKey === original.languageKey) {
      if (chapter.groupName === original.groupName) {
        if (matchesBoth !== null) {
          matchesBoth = matchesBoth.time > chapter.time ? matchesBoth : chapter;
        } else {
          matchesBoth = chapter;
        }
      } else {
        if (matchesLanguage !== null) {
          matchesLanguage = matchesLanguage.time > chapter.time ? matchesLanguage : chapter;
        } else {
          matchesLanguage = chapter;
        }
      }
    }
  });

  if (matchesBoth !== null) {
    return matchesBoth;
  }
  if (matchesLanguage !== null) {
    return matchesLanguage;
  }
  return null;
}

function consolidateAndSortChapters(chapterList: Chapter[]): Chapter[] {
  const grouped: { [index: string]: Chapter[] } = {};
  chapterList.forEach((chapter: Chapter) => {
    const key = chapter.chapterNumber === '' ? chapter.sourceId : chapter.chapterNumber;

    if (grouped[key] === undefined) {
      grouped[key] = [];
    }

    grouped[key].push(chapter);
  });

  const chapters: Chapter[] = [];
  Object.keys(grouped).forEach((key) => {
    const groupedChapters = grouped[key];

    let chapter = groupedChapters.find((chap) => chap.read);
    if (chapter === undefined) {
      [chapter] = groupedChapters;
    }

    chapters.push(chapter);
  });

  return chapters.sort(
    (a: Chapter, b: Chapter) => parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber),
  );
}

/**
 * Get the number of unread chapters from a list.
 * This function calculates a value using the Chapter.chapterNumber field and read status of each
 * chapter. It is not necessarily correlated with the number of chapter objects in the list.
 * @param chapterList the list of chapters to calculate from (usually all of a series' chapters)
 * @returns the number of unread chapters (by chapter number)
 */
export function getNumberUnreadChapters(chapterList: Chapter[]): number {
  let highestRead = 0;
  let highestReleased = 0;
  let previousChapNumber = 0;
  let cumulativeGaps = 1;

  const chapters = consolidateAndSortChapters(chapterList);

  chapters.forEach((chapter: Chapter, index: number) => {
    let absoluteNumber = cumulativeGaps + index;
    const chapterNumber = parseFloat(chapter.chapterNumber);

    const gap = Math.ceil(chapterNumber - previousChapNumber) - 1;
    if (gap > 1) {
      // A gap between chapters was found. Account for this in the absolute numbers
      absoluteNumber += gap;
      cumulativeGaps += gap;
    }

    if (chapter.read && absoluteNumber > highestRead) {
      highestRead = absoluteNumber;
    }
    if (absoluteNumber > highestReleased) {
      highestReleased = absoluteNumber;
    }

    previousChapNumber = chapterNumber;
  });

  return Math.ceil(highestReleased - highestRead);
}
