const tokenAxios = axios.create({
  headers:{
    'x-access-token': window.localStorage.getItem('token'),
  }
});

const token = window.localStorage.getItem('token');

function submitForm(e){
  e.preventDefault();
  let success = true;
  if($(`#oldPassword`)[0].value=="") {$(`#oldPassword`).addClass("input-danger"); success=false;}
  if(!success) {console.log(success); return;}
  var d = new Date();
  var useID = e.target.id.split("Submit")[0];
  tokenAxios.put('/api/auth/user',{
    user_id: $(`#user_id`)[0].value,
    oldPassword: $(`#oldPassword`)[0].value,
    newPassword: $(`#newPassword`)[0].value,
    newPasswordCheck: $(`#newPasswordCheck`)[0].value,
  	name: $(`#name`)[0].value,
  	dorm: $(`#dorm_name`)[0].value,
  	room_no: $(`#room_no`)[0].value,
  })
  .then((result) => {
    alert("Updated!");
    $(`#oldPassword`)[0].value = "";
    $(`#newPassword`)[0].value = "";
    $(`#newPasswordCheck`)[0].value = "";
  })
  .catch((err)=>{
    const errMsg = err.response.data.message;
    alert(errMsg);
    switch(errMsg){
      case "Unauthorized":
        location.reload();
        break;
      case "User not exists":
        location.reload();
        break;
      case "Wrong password":
        $(`#oldPassword`).addClass("input-danger");
        break;
      case "Password not match":
        $(`#newPasswordCheck`).addClass("input-danger");
        break;
      default:
        console.log(errMsg);
    }
  })
}

const userPromise = async () => {
  let userInfo = {};
  try{
    const res = await tokenAxios.get('/api/auth/user');
    userInfo = res.data;
    if(res.data.user_id == -1) {
      userInfo.status = -1;
    }
    return userInfo;
  }catch(e){
    console.log("userPromise: "+e);
    userInfo.status = -1;
    return userInfo;
  }
}

const loginCheckPromise = async (infos) => {
  if(infos.status == -1){
    $(location).attr('href', '/signin');
    return -1;
  }else{
    return infos;
  }
}

for(let i=0;i<Object.keys(EngToKo).length;i++){
  $("#dorm_name")[0].innerHTML +=
    `<option value=${Object.keys(EngToKo)[i]}>${EngToKo[Object.keys(EngToKo)[i]]}</option>`;
}

userPromise()
.then(loginCheckPromise)
.then((userInfo) => {
  $("#user_id")[0].value = userInfo.user_id;
  $("#name")[0].value = userInfo.name;
  $("#dorm_name")[0].value = userInfo.dorm;
  $("#room_no")[0].value = userInfo.room_no;
  $("#user_name")[0].innerHTML = userInfo.user_id +" "+ userInfo.name;

})
