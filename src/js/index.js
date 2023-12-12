import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { NewsApiServer } from './pixabay-api';
import { createMarkup } from './markup';

const searchForm = document.querySelector('.search-form');
const galleryContainer = document.querySelector('.gallery');
const btnLoadMore = document.querySelector('.load-more');
const loader = document.querySelector('.loader');

searchForm.addEventListener('submit', onSubmitForm);

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const newsApiServer = new NewsApiServer();

loader.classList.replace('loader', 'hidden');

//Зчитуємо форму при сабміті
function onSubmitForm(evt) {
  evt.preventDefault();
  window.scrollTo(0, 0);
  clearPage();

  newsApiServer.searchQuery = evt.currentTarget.elements.searchQuery.value
    .trim()
    .toLowerCase()
    .split(' ')
    .join('+');
  console.log(newsApiServer.searchQuery);

  if (newsApiServer.searchQuery === '') {
    return Notiflix.Notify.info('Please fill in the search field.');
  }

  fetchPhoto();
}

//фетч картинок і відображення
function fetchPhoto() {
  clearPage();

  newsApiServer
    .fetchImages()
    .then(data => {
      if (data.totalHits === 0) {
        clearPage();
        return Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);

        window.addEventListener('scroll', infinityScroll);
        
        appendPhotoMarkup(data);
        pageScrolling();
        lightbox.refresh();

        newsApiServer.totalImgs += data.hits.length;
        console.log('data.hits', newsApiServer.totalImgs);
        
      }
    })
    .catch(error => console.log(error.message));
}

//завантаження / перевірка коли користувач дійшов до кінця колекції
// Load More
function onLoadMore() {
  newsApiServer
    .fetchImages()
    .then(data => {
      appendPhotoMarkup(data);
      pageScrolling();
      lightbox.refresh();

      newsApiServer.totalImgs += data.hits.length;
      console.log('data.hits', newsApiServer.totalImgs);

      if (data.totalHits <= newsApiServer.totalImgs) {
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        window.removeEventListener('scroll', infinityScroll);
        loader.classList.replace('loader', 'hidden');
        totalImgs = 0;
      }
    })
    .catch(error => console.log(error.message));
}

//Функція додавання розмітки на сторінку
function appendPhotoMarkup(data) {
  galleryContainer.insertAdjacentHTML('beforeend', createMarkup(data.hits));
}

//Очищення сторінки
function clearPage() {
  galleryContainer.innerHTML = '';
  newsApiServer.page = 1;
  newsApiServer.resetPage();
  newsApiServer.totalImgs = 0;
}

//Функція плавного прокручування сторінки
function pageScrolling() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 1.5,
    behavior: 'smooth',
  });
}

// Infinity scroll
function infinityScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    onLoadMore();
  }

  loader.classList.replace('hidden', 'loader');
}
