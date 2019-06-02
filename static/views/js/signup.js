const submitForm = (e) => {
  e.preventDefault();
  //axios signup
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
    console.log(err.response);
    $("#message")[0].removeAttribute('hidden');
    $("#message")[0].innerHTML = err.response.data.message;
  })
}
