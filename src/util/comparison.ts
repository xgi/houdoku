/* eslint-disable no-lonely-if */
import { Chapter } from '../models/types';

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
export function selectMostSimilarChapter(
  original: Chapter,
  options: Chapter[]
): Chapter | null {
  if (
    options.find((chapter: Chapter) => chapter.id === original.id) !== undefined
  ) {
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
          matchesLanguage =
            matchesLanguage.time > chapter.time ? matchesLanguage : chapter;
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

  chapterList.forEach((chapter: Chapter) => {
    const chapterNumber = parseFloat(chapter.chapterNumber);
    if (chapter.read && chapterNumber > highestRead) {
      highestRead = chapterNumber;
    }
    if (chapterNumber > highestReleased) {
      highestReleased = chapterNumber;
    }
  });

  return Math.ceil(highestReleased - highestRead);
}
