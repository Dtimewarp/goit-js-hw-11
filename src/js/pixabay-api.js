import axios from 'axios';

const KEY = '41107033-20f612c52ee0102e5a994dfd8';
const URL = 'https://pixabay.com/api/';

export class NewsApiServer {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.per_page = 40;
    this.totalImgs = 0;
  }

  async fetchImages() {
    // console.log(this);
    try {
      const response = await axios.get(
        `${URL}?key=${KEY}&q=${this.searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${this.per_page}&page=${this.page}`
      );
      this.incrementPage();

      console.log('p', this.page);
      console.log('response.data', response.data);
      return response.data;
    } catch (error) {
      console.log(error.message);
    }
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }
}

