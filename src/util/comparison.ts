/* eslint-disable no-lonely-if */
import { Chapter } from '../models/types';

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
        matchesBoth = chapter;
      } else {
        // if multiple match the language, save the most recently released one
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
