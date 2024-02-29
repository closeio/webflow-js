setTimeout(function() {
    const modal = document.getElementById('modal_component');
    const modalClose = document.getElementById('modal_close-button');
    let modalShown;
    let startTime;
    let returningVisitor;
    //let modalException = true; // Exception status for working on first-time visitors
    //let noModal = true; // Prevent modal from ever showing

    // Function to check and display the visitor status
    function checkVisitorStatus() {
        // Get the stored visit timestamp
        let firstVisitTimestamp = localStorage.getItem('firstVisitTimestamp');

        // Check if the user is a returning visitor based on a 1-hour threshold
        if (firstVisitTimestamp && (Date.now() - firstVisitTimestamp > 1 * 60 * 60 * 1000)) {
            // Returning visitor
            returningVisitor = true;
            if (localStorage.getItem('returnVisitTimestamp') == null) {
                localStorage.setItem('returnVisitTimestamp', Date.now());
            }
        } else {
            // First-time visitor
            returningVisitor = false;

            if (localStorage.getItem('firstVisitTimestamp') == null) {
                localStorage.setItem('firstVisitTimestamp', Date.now());
            }
        }
    }

    checkVisitorStatus();

    // Has the modal been shown in the past?
    if (localStorage.getItem('trialModalShown') === 'true') {
        modalShown = true;
    } else {
        modalShown = false;
    }

    // Show Modal
    function showModal() {
        // Okay to show modal
        if (!noModal) {
            // Only show on desktop & tablet
            if (window.innerWidth >= 768) {
                modal.style.display = 'flex';
                modalShown = true;
                localStorage.setItem('trialModalShown', 'true');
                
                // Send data to Segment
                analytics.identify(analytics.user().anonymousId());
                analytics.track('Popup Viewed', {
                    popup_name: 'Start Free Trial',
                    url: document.URL
                });
            }
        }
    }

    // Modal close button
    modalClose.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Show Modal
    if (modalException || returningVisitor) {
        // Show modal on exit
        document.addEventListener('mouseleave', function (event) {
            // Check if the cursor is outside the document area
            if (!modalShown && (modalException || returningVisitor) && (event.clientY <= 0 || event.clientY >= window.innerHeight ||
                event.clientX <= 0 || event.clientX >= window.innerWidth)) {            
                setTimeout(function() {
                    showModal();
                }, 1000);            
            }
        });

        // Show modal after 5 minutes
        if (modalException) {
            if (returningVisitor) {
                startTime = localStorage.getItem('returnVisitTimestamp');
            } else {
                startTime = localStorage.getItem('firstVisitTimestamp');
            }
        } else {
            startTime = localStorage.getItem('returnVisitTimestamp');
        }
        var intervalId = setInterval(function () {
            var currentTime = Date.now();
            var elapsedTime = (currentTime - startTime) / 1000; // Convert milliseconds to seconds

            // Check if the user has been on the website for more than 5 minutes (300 seconds)
            if (elapsedTime >= 300) {
                // Stop the interval
                clearInterval(intervalId);

                // Show modal
                if (!modalShown) {
                    showModal();
                }
            }
        }, 1000);
    }
}, 2000);