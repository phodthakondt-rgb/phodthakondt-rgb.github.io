document.addEventListener('DOMContentLoaded', (event) => {
    const menuToggle = document.querySelector('.menu-toggle');
    const closeBtn = document.querySelector('.close-btn');
    const sideMenu = document.getElementById('side-menu');
    const overlay = document.getElementById('overlay');

    menuToggle.addEventListener('click', () => {
        sideMenu.classList.add('open');
        overlay.classList.add('show');
    });

    closeBtn.addEventListener('click', () => {
        sideMenu.classList.remove('open');
        overlay.classList.remove('show');
    });

    overlay.addEventListener('click', () => {
        sideMenu.classList.remove('open');
        overlay.classList.remove('show');
    });
});
