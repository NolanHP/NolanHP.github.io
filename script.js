// Get the theme toggle switch
const themeSwitch = document.getElementById('theme-switch');

if (themeSwitch) {
    console.log('Toggle switch found'); // Check if the switch is detected

    // Check for saved user preference in localStorage
    const currentTheme = localStorage.getItem('theme');
    console.log('Current theme from localStorage:', currentTheme);

    // Apply saved theme
    if (currentTheme) {
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(currentTheme);
        themeSwitch.checked = currentTheme === 'dark-mode';
        console.log('Applied saved theme:', currentTheme);
    }

    // Event listener to toggle theme
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark-mode');
            console.log('Switched to dark mode');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light-mode');
            console.log('Switched to light mode');
        }
    });
} else {
    console.log('Toggle switch not found'); // If the switch is not found, we need to fix this
}
