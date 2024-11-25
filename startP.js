// Wait until the DOM is fully loaded before executing the script
document.addEventListener("DOMContentLoaded", function() {
    // Get the 'Start' button using its ID
    const startBtn = document.getElementById('start-btn');
    
    // Check if the button is correctly selected
    if (startBtn) {
        // Add an event listener to the button for the 'click' event
        startBtn.addEventListener('click', function() {
            // Log a message to the console to confirm the button click
            console.log('Start button clicked!');
            
            // Redirect to the game page (make sure the path is correct)
            window.location.href = 'doodle-jump-master/index.html';  // Adjust the path based on your folder structure
        });
    } else {
        // Log an error if the button is not found
        console.error('Start button not found!');
    }
});
