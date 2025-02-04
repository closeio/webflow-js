// Other field
const businessDescription = document.getElementById('business_description');
const otherField = document.getElementById('business_description_other_wrapper');

businessDescription.addEventListener('change', function() {
  if (businessDescription.value === 'other') {
    otherField.classList.remove('hidden');
    otherField.children[0].focus(); 
    otherField.children[0].setAttribute("required", true);
  } else {
    otherField.classList.add('hidden');
    otherField.children[0].value = '';
    otherField.children[0].removeAttribute("required");
  }
});

// Form handler
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
    
    // Phone number verification
    const phoneNumberInput = document.getElementById('phone_number').value;

    try {
        const phoneNumber = libphonenumber.parsePhoneNumber(phoneNumberInput, {
            defaultCountry: 'US', // You can set this to any default country if desired
        });

        if (phoneNumber.isValid()) {
            
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
                fetch(formAction, {
                method: formMethod,
                body: formData
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
                // Redirect to SavvyCal if team > 1 person
                const salesTeamSizeInput = encodeURIComponent(document.getElementById('sales_team_size').value);
                const displayName = encodeURIComponent(document.getElementById('first_name').value + " " + document.getElementById('last_name').value);
                const emailInput = encodeURIComponent(document.getElementById('email').value);
                const companyInput = encodeURIComponent(document.getElementById('company_name').value);
                
                if (salesTeamSizeInput != 1) { window.location = "/sales-calendar?displayName=" + displayName + "&email=" + emailInput + "&company_name=" + companyInput + "&sales_team_size=" + salesTeamSizeInput; return; }
                
                $form
                .hide() // optional hiding of form
                .siblings('.w-form-done').show() // Show success
                .siblings('.w-form-fail').hide(); // Hide failure
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

        } else {
            // Phone number not valid: Show error message
            document.getElementById('phone_number_error').classList.remove('hidden');
        }
    } catch (error) {
        //alert('Error: ' + error.message);
				document.getElementById('phone_number_error').classList.remove('hidden');
    }
  });
});