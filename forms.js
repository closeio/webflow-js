var Webflow = Webflow || [];
Webflow.push(function() {
  // unbind webflow form handling (keep this if you only want to affect specific forms)
  $(document).off('submit');
  /* Any form on the page */
  $('.cf-replacement').submit(function(e) {
    e.preventDefault();
  	const $form = $(this); // The submitted form
    const $submit = $('[type=submit]', $form); // Submit button of form
    const buttonText = $submit.val(); // Original button text
    const buttonWaitingText = $submit.attr('data-wait'); // Waiting button text value
    const formMethod = $form.attr('method'); // Form method (GET/POST)
    const formAction = $form.attr('action'); // Form action (your Xano endpoint URL)
    const formRedirect = $form.attr('data-redirect'); // Form redirect location
    // if we're editing
    // const xanoID = document.getElementById('id').value // getting the ID of the record to edit
    // let requestURL = formAction.concat(xanoID + "?")
    const formData = new FormData($form.get(0)); // Form data
    // console.log(formData) // log request URL to console
    // Set waiting text
    if (buttonWaitingText) {
      $submit.val(buttonWaitingText);
    }
	
	let submission = new Promise(function(resolve, reject) {
	    // Get the form data from the event object
	    let obj = {};
	    let email;

	    let entries = [...formData.entries()];
		
	    entries.forEach((entry) => (obj[entry[0]] = entry[1]));
	    email = obj["email"];
	    delete obj.email;

	    // Get UTM cookie data
	    let cookies = document.cookie.split(';');
	    let utmCookies = {};

	    cookies.forEach(cookie => {
	      let [name, value] = cookie.split('=').map(s => s.trim());
	      if (name.includes('utm')) {
	        utmCookies[name] = decodeURIComponent(value);
	      }
	    });

	    // Send data to Segment
        analytics.identify(email);
        analytics.identify({
            email: email,
            last_form_submission_confirmation_url: obj["last_form_submission_confirmation_url"],
            last_form_submission_name: $form.get(0).attributes[2].nodeValue,
            last_submission_url: document.URL
        });
	    analytics.track("Form Submission", {
            form_name: $form.get(0).attributes[2].nodeValue,
            email: email,
            fields: obj,
            url: document.URL,
            utm: utmCookies
	    });
		
		setTimeout(function() {
		    resolve('Success!');
		  }, 1000);
	});

	submission.then(function(result) {
	    // If form redirect setting set, then use this and prevent any other actions
	    if (formRedirect) { window.location = formRedirect; return; }
	  	$form
	    	.hide() // optional hiding of form
	  		.siblings('.w-form-done').show() // Show success
	    	.siblings('.w-form-fail').hide(); // Hide failure
      }).catch(function(error) {
        console.log(error);
        $('.error-message-text').text(error);
          $form
           .siblings('.w-form-done').hide() // Hide success
           .siblings('.w-form-fail').show(); // show failure
      }).finally(function() {
          // Reset text
          $submit.val(buttonText);
      });
  });
});