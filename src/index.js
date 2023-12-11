import Notiflix from 'notiflix';
import '../src/css/style.css';
import { fetchBreeds, fetchCatByBreed } from './js/cat-api';
import SlimSelect from 'slim-select';
import 'slim-select/dist/slimselect.css';



const refs = {
  breedSelect: document.querySelector('.breed-select'),
  catInfo: document.querySelector('.cat-info'),
  loader: document.querySelector('.loader'),
  errorParagraph: document.querySelector('.error'),
};
const { breedSelect, catInfo, loader, errorParagraph } = refs;

loader.classList.replace('loader', 'is-hidden');
errorParagraph.classList.add('is-hidden');
catInfo.classList.add('is-hidden');

let arrayBreedsId = [];
fetchBreeds()
  .then(data => {
    data.forEach(element => {
      arrayBreedsId.push({ text: element.name, value: element.id });
    });
    new SlimSelect({
      select: breedSelect,
      data: arrayBreedsId,
    });
  })
  .catch(onFetchError);

breedSelect.addEventListener('change', onSelect);

function onSelect(evt) {
  loader.classList.replace('is-hidden', 'loader');
  breedSelect.classList.add('is-hidden');
  catInfo.classList.add('is-hidden');

  const breedId = evt.currentTarget.value;
  fetchCatByBreed(breedId)
    .then(data => {
      loader.classList.replace('loader', 'is-hidden');
      breedSelect.classList.remove('is-hidden');
      const { url, breeds } = data[0];

      catInfo.innerHTML = `<div><img src="${url}" alt="${breeds[0].name}" width="420"/></div><div class="box"><h1>${breeds[0].name}</h1><p>Origin: ${breeds[0].origin}</p><p>${breeds[0].description}</p><p><b>Temperament:</b> ${breeds[0].temperament}</p></div>`;
      catInfo.classList.remove('is-hidden');
    })
    .catch(onFetchError);
}

function onFetchError(error) {
  breedSelect.classList.remove('is-hidden');
  loader.classList.replace('loader', 'is-hidden');

  Notiflix.Notify.failure(
    'Oops! Something went wrong! Try reloading the page!'
  );
}
