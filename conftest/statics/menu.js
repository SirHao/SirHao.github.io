var txt;
var url;
var jump = 0;

$('#site-menu').on('show.bs.collapse', function (e) {
  txt = $("#toggle").text();
  $("#toggle").text("MENU");
})

$('#site-menu').on('shown.bs.collapse', function (e) {
  //if($(this).offset().top + $(this).height() - $(window).scrollTop() - $(window).height() > 0) {
    $('html,body').animate({scrollTop: $("#toggle").offset().top}, 600);
  //}
})

$('#site-menu').on('hide.bs.collapse', function (e) {
  if(jump!=0){ $("#toggle").text("MENU - " + jump); }
  else { $("#toggle").text(txt); }
})

$('#site-menu').on('hidden.bs.collapse', function (e) {
  $('html,body').animate({scrollTop: 0}, 600, function(){
    if(jump!=0){ window.location.href = url; jump = 0; }
  });
})

$('.jump-page').click(function() {
  if($(window).width() < 768) {
    url = $(this).attr("href");
    jump = $(this).text();
    $('#toggle').click();
    return false;
  }
});