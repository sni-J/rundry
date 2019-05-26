$("body").on("click", "a[data-toggle='pill']", (e)=>{
  $("a[data-toggle='pill']").removeClass('active');
  $("a[data-toggle='pill']").removeClass('show');
  $(".list-tab-pane").removeClass('active');
  $(".list-tab-pane").removeClass('show');
});

$(".sparcs-nav-link").click((e)=>{
  if(e.target.getAttribute('href')==window.location.pathname){
    e.preventDefault();
  }
})
