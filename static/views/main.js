$("a[data-toggle='pill']").click((e)=>{
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

$("button[id$='useForm']").click((e)=>{
  e.preventDefault();
  var useID = e.target.id.split("useForm")[0];
  if($(e.target).attr('X')=="true"){
    $(`li[id^='${useID}'][id$='Li']`).remove();
    $(e.target).html("사용");
    $(e.target).removeAttr('X');
  }else{
    $(e.target).html("취소");
    $(e.target).attr("X", "true");
    var ul = e.target.closest("ul");
    var li = $(`
      <li id="${useID}TimeLi" class="list-group-item">
        <div class="row">
          <div class="col-md-4">예상 소요 시간</div>
          <div class="col-md-7 d-flex">
            <input type="number" class="form-control input-sm" id="${useID}Hour"></input> :
            <input type="number" class="form-control input-sm" id="${useID}Minute"></input>
          </div>
        </div>
      </li>
      <li id="${useID}MemoLi" class="list-group-item">
        <div class="row">
          <div class="col-md-4">메모</div>
          <div class="col-md-7"><input type="text" class="form-control input-sm" id="useMemo"></input></div>
        </div>
      </li>
      <li id="${useID}ButtonLi" class="list-group-item">
        <button id="${useID}Submit" class="btn btn-primary btn-block" onclick="submitForm(event)">사용</button>
      </li>
    `);
    $(ul).append(li);
  }
});

function submitForm(e){
  e.preventDefault();
  var d = new Date();
  var useID = e.target.id.split("Submit")[0];
  $("#useID")[0].value = useID;
  $("#useStartTime")[0].value = parseInt(d.getTime()/60000);
  $("#useEndTime")[0].value = parseInt(d.getTime()/60000) + parseInt($(`#${useID}Hour`)[0].value)*60+parseInt($(`#${useID}Minute`)[0].value);
  //axios 사용 가능 -> 사용 중 (유효성 체크 要)
}

$("button[id$='freeBtn']").click((e)=> {
  e.preventDefault();
  var useID = e.target.id.split("freeBtn")[0];
  //axios 수거 미확인 -> 사용 가능
});
