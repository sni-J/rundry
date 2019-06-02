const submitForm = (e) => {
  e.preventDefault();
  //axios signin
  axios.post('/api/auth/signin', {
    user_id: $("#user_id")[0].value,
    password: $("#password")[0].value,
  })
  .then((result) => {
    $("#message")[0].setAttribute('hidden',"");
    window.localStorage.setItem('token', result.data.token);
    $(location).attr('href', '/main');
  })
  .catch((err)=>{
    $("#message")[0].removeAttribute('hidden');
    $("input").removeClass("input-danger");
    const errMsg = err.response.data.message;
    $("#message")[0].innerHTML = errMsg;
    switch(errMsg){
      case "User not exists":
        $("#user_id").addClass("input-danger");
        break;
      case "Wrong password":
        $("#password").addClass("input-danger");
        break;
      default:
        console.log(errMsg);
    }
  })
}
