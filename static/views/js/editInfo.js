const tokenAxios = axios.create({
  headers:{
    'x-access-token': window.localStorage.getItem('token'),
  }
});

const token = window.localStorage.getItem('token');

function submitForm(e){
  e.preventDefault();
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
  .then((result) => {console.log(result);})
  .catch((err)=>{alert('DB error'); console.log(err);})
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

for(let i=0;i<Object.keys(EngToKo).length;i++){
  $("#dorm_name")[0].innerHTML +=
    `<option value=${Object.keys(EngToKo)[i]}>${EngToKo[Object.keys(EngToKo)[i]]}</option>`;
}

userPromise()
.then((userInfo) => {
  $("#user_id")[0].value = userInfo.user_id;
  $("#name")[0].value = userInfo.name;
  $("#dorm_name")[0].value = userInfo.dorm;
  $("#room_no")[0].value = userInfo.room_no;
  $("#user_name")[0].innerHTML = userInfo.user_id +" "+ userInfo.name;

})
