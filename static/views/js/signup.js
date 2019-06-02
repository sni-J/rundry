const submitForm = (e) => {
  e.preventDefault();
  let success=true;
  $("input").removeClass("input-danger");
  if($(`#user_id`)[0].value=="") {$(`#user_id`).addClass("input-danger"); success=false; }
  if($(`#password`)[0].value=="") {$(`#password`).addClass("input-danger"); success=false; }
  if($(`#passwordCheck`)[0].value=="") {$(`#passwordCheck`).addClass("input-danger"); success=false; }
  if($(`#name`)[0].value=="") {$(`#name`).addClass("input-danger"); success=false; }
  if($(`#dorm_name`)[0].value=="") {$(`#dorm_name`).addClass("input-danger"); success=false; }
  if($(`#room_no`)[0].value=="") {$(`#room_no`).addClass("input-danger"); success=false; }
  if(!success) {console.log(success); return;}
  axios.post('/api/auth/signup', {
    user_id: $(`#user_id`)[0].value,
    password: $(`#password`)[0].value,
  	passwordCheck: $(`#passwordCheck`)[0].value,
  	name: $(`#name`)[0].value,
  	dorm: $(`#dorm_name`)[0].value,
  	room_no: $(`#room_no`)[0].value,
  })
  .then((result)=> {
    $(location).attr('href', '/signin');
  })
  .catch((err)=> {
    const errMsg = err.response.data.message;
    $("#message")[0].removeAttribute('hidden');
    $("#message")[0].innerHTML = errMsg;
    switch(errMsg){
      case "User already exists":
        $(`#user_id`).addClass("input-danger");
        break;
      case "Password does not match":
        $(`#passwordCheck`).addClass("input-danger");
        break;
      default:
        console.log(errMsg);
    }
  })
}

for(let i=0;i<Object.keys(EngToKo).length;i++){
  $("#dorm_name")[0].innerHTML +=
    `<option value=${Object.keys(EngToKo)[i]}>${EngToKo[Object.keys(EngToKo)[i]]}</option>`;
}
