$(document).ready(function() {
  $("#form-task-msg").submit(function(e) {
    $.ajax({
        url: '/submit_task_msg',
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify($(this).serializeArray()),
      })
      .done(function(data) {
        if (data.error) {
          alert("This Error Occured " + data.error);
        } else
          alert(data);
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        alert(errorThrown);
        alert(textStatus)
      });
    e.preventDefault();
  });

  $("#form-status-msg").submit(function(e) {
    $.ajax({
        url: '/submit_status_msg',
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify($(this).serializeArray()),
      })
      .done(function(data) {
        if (data.error) {
          alert("This Error Occured " + data.error);
        } else
          alert(data);
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        alert(errorThrown);
        alert(textStatus)
      });
    e.preventDefault();
  });
});
