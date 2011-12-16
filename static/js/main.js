function failedToComplete() {
  setupForm();
  $(".mailing_list .sad_failure").show();
}

function greatSuccess(email) {
  $(".mailing_list *").unbind();
  $(".mailing_list > div, .mailing_list > input, .mailing_list > button").hide();
  $(".mailing_list div.done span.email").text(email);
  $(".mailing_list > div.done").show();
}

function setupForm() {
  $(".mailing_list *").unbind();
  $(".mailing_list > button").show();
  $(".mailing_list > div").hide();
  $('.mailing_list input').removeAttr("disabled");

  $(".mailing_list > button").click(function() {
    var email = $.trim($('.mailing_list input').val());

    if(!email) {
      alert("the email field is required!");
      return;
    }
    else if(!/^[\w.!#$%&'*+\-/=?\^`{|}~]+@[a-z\d-]+(\.[a-z\d-]+)+$/i.test(email)) {
      alert("That is not a valid email address!");
      return;
    }

    $('.mailing_list input').attr("disabled", true);
    $('.mailing_list > button').fadeOut(200, function() {
      $('.mailing_list .next_step').fadeIn(500, function() {
        $(".mailing_list .next_step button").click(function() {
          $('.mailing_list .next_step').hide();
          $('.mailing_list .waiting').show();
          navigator.id.get(function(assertion) {
            if (!assertion) return failedToComplete();
            $.ajax({
              type: 'POST',
              url: '/api/register',
              data: { assertion: assertion },
              success: function(res, status, xhr) {
                if (res.success && res.email) {
                  greatSuccess(res.email);
                } else {
                  failedToComplete();
                }
              },
              error: function(res, status, xhr) {
                failedToComplete();
              }
            });
          }, {
            requiredEmail: email
          });
        });
      });
    });
  });

  // register a click handler for our button
  $('.mailing_list input').keypress(function() {
    $('.mailing_list > button').removeAttr("disabled");
    $('.mailing_list input').unbind();
  });
}

$(document).ready(function() {
  setupForm();
});
