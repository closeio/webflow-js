var Webflow = Webflow || [];
Webflow.push(function () {
  // unbind webflow form handling (keep this if you only want to affect specific forms)
  $(document).off('submit');
  
  /* Any CF replacement form on the page */
  $('.cf-replacement').submit(function (e) {
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

    let submission = new Promise(function (resolve, reject) {
      // Get the form data from the event object
      let obj = {};
      let email;

      let entries = [...formData.entries()];

      entries.forEach((entry) => (obj[entry[0]] = entry[1]));
      email = obj["email"];
      delete obj.email;

      // Get UTM cookie data
      let cookies = document.cookie.split(';');
      let utmData = {};

      cookies.forEach(cookie => {
        let [name, value] = cookie.split('=').map(s => s.trim());
        if (name.includes('utm') || name.includes('gclid')) {
          utmData[name.replace('_last', '')] = decodeURIComponent(value);
        }
      });

      // Submit data to Zapier
      fetch('https://hooks.zapier.com/hooks/catch/14496686/2daprvy/', {
        method: 'POST',
        body: JSON.stringify({
                form_name: $form.get(0).attributes[2].nodeValue,
                email: email,
                fields: obj,
                url: document.URL,
                context: {
                    campaign: {
                    ...utmData,
                    }
                }
            })
        })
        .then(response => {
        if (!response.ok) {
            throw new Error(`Error pushing data: ${response.statusText}`);
        }
        console.log("Data pushed successfully!");
        })
        .catch(error => console.error("Error:", error));      

        // Send data to Segment
        try {
            analytics.identify(analytics.user().anonymousId(), {
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
                context: {
                    campaign: {
                    ...utmData,
                    }
                }
            });
        } catch (error) {
            console.log("Ad blocker active");
        }

      // Add email to local storage
      localStorage.setItem('email_given', email);

      setTimeout(function () {
        resolve('Success!');
      }, 1000);
    });

    submission.then(function (result) {
      // If form redirect setting set, then use this and prevent any other actions
      if (formRedirect) { window.location = formRedirect; return; }
      $form
        .hide() // optional hiding of form
        .siblings('.w-form-done').show() // Show success
        .siblings('.w-form-fail').hide(); // Hide failure

      // If submitting a form to allow for /tools usage
      if ($('.tool-popover_component').hasClass('tool-popover_component')) {
        $('.tool-popover_component').hide();
      }

    }).catch(function (error) {
      console.log(error);
      $('.error-message-text').text(error);
      $form
        .siblings('.w-form-done').hide() // Hide success
        .siblings('.w-form-fail').show(); // show failure
    }).finally(function () {
      // Reset text
      $submit.val(buttonText);
    });
  });
});