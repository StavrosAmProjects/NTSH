const switcher = document.querySelector('#language');
let language = 'el';
switcher.addEventListener('click', () => {
  language = language === 'el' ? 'en' : 'el';
  document.documentElement.lang = language;
  switcher.textContent = language === 'el' ? 'EN' : 'ΕΛ';
  document.querySelectorAll('[data-el][data-en]').forEach((node) => {
    node.innerHTML = node.dataset[language];
  });
});
