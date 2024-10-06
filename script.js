// Get the theme toggle switch
const themeSwitch = document.getElementById('theme-switch');

// Check for saved user preference in localStorage
const currentTheme = localStorage.getItem('theme');

// Apply saved theme
if (currentTheme) {
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(currentTheme);
    themeSwitch.checked = currentTheme === 'dark-mode';
}

// Event listener to toggle theme
themeSwitch.addEventListener('change', function() {
    if (this.checked) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light-mode');
    }
});
