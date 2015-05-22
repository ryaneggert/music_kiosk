$('form').submit(function(event) {
  event.preventDefault();
  console.log(this.guestname.value);
  $.post('/auth/login/guest', {
      name: this.guestname.value
    })
    .done(function(data) {
      if (data.redirect) {
        window.location = data.redirect; // send to bingo
      }
    })
    .fail(function() {
      console.log('Guest login error'); // bugger
    });
});
