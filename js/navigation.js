// Navigation functionality for mobile and desktop views

document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('open-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    
    // Open sidebar on mobile
    openSidebarBtn.addEventListener('click', function() {
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.add('translate-x-0');
    });
    
    // Close sidebar on mobile
    closeSidebarBtn.addEventListener('click', function() {
        sidebar.classList.remove('translate-x-0');
        sidebar.classList.add('-translate-x-full');
    });
    
    // Handle responsive behavior
    function handleResize() {
        if (window.innerWidth >= 768) { // MD breakpoint
            sidebar.classList.remove('-translate-x-full');
            sidebar.classList.add('translate-x-0');
        } else {
            sidebar.classList.remove('translate-x-0');
            sidebar.classList.add('-translate-x-full');
        }
    }
    
    // Initial call
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Add active class to current page link
    highlightCurrentPage();
});

/**
 * Adds active class to the current page's link in the navigation
 */
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('#sidebar a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // Check if the current path matches the link path or if we're on the homepage
        if (currentPath.endsWith(linkPath) || 
            (currentPath.endsWith('/') && linkPath === 'index.html')) {
            link.classList.add('bg-gray-700');
            link.classList.add('font-bold');
        } else {
            link.classList.remove('bg-gray-700');
            link.classList.remove('font-bold');
        }
    });
}



