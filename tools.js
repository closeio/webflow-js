// Check if email has been given
const email_given_exists = localStorage.getItem('email_given') !== null;
let email_given;
if (email_given_exists) {
    email_given = localStorage.getItem('email_given');
    console.log(email_given);
}

// Check to see if user has used a tool
const tool_uses_exists = localStorage.getItem('tool_uses') !== null;
let tool_uses;
if (tool_uses_exists) {
    tool_uses = parseInt(localStorage.getItem('tool_uses')) + 1;
    localStorage.setItem('tool_uses', tool_uses);
} else {
    localStorage.setItem('tool_uses', 1);
    tool_uses = 1;
}

// If user hasn't given email and has used tools twice
if (!email_given_exists && tool_uses > 2) {
    $('.tool-popover_component').show();
}