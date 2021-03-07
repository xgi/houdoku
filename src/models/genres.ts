import { Genre, GenreKey } from './types';

// eslint-disable-next-line import/prefer-default-export
export const Genres: { [key: string]: Genre } = {
  [GenreKey.ACTION]: { key: GenreKey.ACTION, name: 'Action' },
  [GenreKey.ADVENTURE]: { key: GenreKey.ADVENTURE, name: 'Adventure' },
  [GenreKey.COMEDY]: { key: GenreKey.COMEDY, name: 'Comedy' },
  [GenreKey.DRAMA]: { key: GenreKey.DRAMA, name: 'Drama' },
  [GenreKey.FANTASY]: { key: GenreKey.FANTASY, name: 'Fantasy' },
  [GenreKey.HISTORICAL]: { key: GenreKey.HISTORICAL, name: 'Historical' },
  [GenreKey.HORROR]: { key: GenreKey.HORROR, name: 'Horror' },
  [GenreKey.MECHA]: { key: GenreKey.MECHA, name: 'Mecha' },
  [GenreKey.MEDICAL]: { key: GenreKey.MEDICAL, name: 'Medical' },
  [GenreKey.MYSTERY]: { key: GenreKey.MYSTERY, name: 'Mystery' },
  [GenreKey.PSYCHOLOGICAL]: {
    key: GenreKey.PSYCHOLOGICAL,
    name: 'Psychological',
  },
  [GenreKey.ROMANCE]: { key: GenreKey.ROMANCE, name: 'Romance' },
  [GenreKey.SCI_FI]: { key: GenreKey.SCI_FI, name: 'Sci-Fi' },
  [GenreKey.SHOUJO_AI]: { key: GenreKey.SHOUJO_AI, name: 'Shoujo Ai' },
  [GenreKey.SHOUNEN_AI]: { key: GenreKey.SHOUNEN_AI, name: 'Shounen Ai' },
  [GenreKey.SLICE_OF_LIFE]: {
    key: GenreKey.SLICE_OF_LIFE,
    name: 'Slice of Life',
  },
  [GenreKey.SPORTS]: { key: GenreKey.SPORTS, name: 'Sports' },
  [GenreKey.TRAGEDY]: { key: GenreKey.TRAGEDY, name: 'Tragedy' },
  [GenreKey.YAOI]: { key: GenreKey.YAOI, name: 'Yaoi' },
  [GenreKey.YURI]: { key: GenreKey.YURI, name: 'Yuri' },
  [GenreKey.ISEKAI]: { key: GenreKey.ISEKAI, name: 'Isekai' },
  [GenreKey.CRIME]: { key: GenreKey.CRIME, name: 'Crime' },
  [GenreKey.MAGICAL_GIRLS]: {
    key: GenreKey.MAGICAL_GIRLS,
    name: 'Magical Girls',
  },
  [GenreKey.PHILOSOPHICAL]: {
    key: GenreKey.PHILOSOPHICAL,
    name: 'Philosophical',
  },
  [GenreKey.SUPERHERO]: { key: GenreKey.SUPERHERO, name: 'Superhero' },
  [GenreKey.THRILLER]: { key: GenreKey.THRILLER, name: 'Thriller' },
  [GenreKey.WUXIA]: { key: GenreKey.WUXIA, name: 'Wuxia' },
};
