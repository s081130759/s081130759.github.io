const themeButton = document.querySelector('.theme-button');
const filterButtons = document.querySelectorAll('.filter');
const logCards = document.querySelectorAll('.log-card');

const savedTheme = localStorage.getItem('activity-log-theme');
if (savedTheme === 'dark') document.body.classList.add('dark');

themeButton.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('activity-log-theme', theme);
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');

    logCards.forEach((card) => {
      const shouldShow = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('is-hidden', !shouldShow);
    });
  });
});
