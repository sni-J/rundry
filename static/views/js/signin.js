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
    console.log(err);
    $("#message")[0].removeAttribute('hidden');
    $("#message")[0].innerHTML = err.response.data.message;
  })
}
