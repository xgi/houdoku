import Library from '../../models/library';
import Series from '../../models/series';

export interface LibraryState {
  library: Library;
  columns: number;
  showingSeries?: Series;
}
