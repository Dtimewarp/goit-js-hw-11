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

//Зчитуємо інформацію з форми при сабміті
function onSubmitForm(evt) {
  evt.preventDefault();
  window.scrollTo(0, 0);
  clearPage();

  newsApiServer.searchQuery = evt.currentTarget.elements.searchQuery.value
    .trim()
    .toLowerCase()
    .split(' ')
    .join('+');
  
  if (newsApiServer.searchQuery === '') {
    return Notiflix.Notify.info('Будь ласка, введіть дані у поле пошуку');
  }

  fetchPhoto();
}

//Запит картинок і їх відображення
function fetchPhoto() {
  clearPage();

  newsApiServer
    .fetchImages()
    .then(data => {
      if (data.totalHits === 0) {
        clearPage();
        return Notiflix.Notify.failure(
          'Вибачте, але нічого не знайдено. Спробуйте ще раз.'
        );
      } else {
        Notiflix.Notify.success(`Ми знайшли за вашим запитом ${data.totalHits} зображень.`);

        newsApiServer.totalImgs += data.hits.length;
        
        appendPhotoMarkup(data);
        pageScrolling();
        lightbox.refresh();

        if (data.totalHits <= newsApiServer.totalImgs) {
          Notiflix.Notify.info(
            "Вибачте, але це кінець колекції за запитом."
          );
          window.removeEventListener('scroll', infinityScroll);
          loader.classList.replace('loader', 'hidden');
          totalImgs = 0;
          return;
        }

        window.addEventListener('scroll', infinityScroll);

        console.log('data.hits', newsApiServer.totalImgs);
      }
    })
    .catch(error => console.log(error.message));
}

//Перевірка наповнення коли юзер доскролив до кінця колекції фото
// Load More
function onLoadMore() {
  newsApiServer
    .fetchImages()
    .then(data => {
      appendPhotoMarkup(data);
      pageScrolling();
      lightbox.refresh();

      newsApiServer.totalImgs += data.hits.length;
      
      if (data.totalHits <= newsApiServer.totalImgs) {
        Notiflix.Notify.info(
          "Вибачте, але це кінець колекції за запитом."
        );
        window.removeEventListener('scroll', infinityScroll);
        loader.classList.replace('loader', 'hidden');
        totalImgs = 0;
      }
    })
    .catch(error => console.log(error.message));
}

//Відмальовування розмітки
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

//Плавний скроллінг
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
