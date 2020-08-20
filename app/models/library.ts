import Series from './series';

export default class Library {
  seriesList: Series[] = [];

  addSeries(series: Series) {
    this.seriesList.push(series);
  }
}
