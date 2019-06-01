const submitForm = (e) => {
  e.preventDefault();
  //axios signup
  axios.post('/api/user', {
    user_id: $(`#user_id`)[0].value,
  	password: $(`#password`)[0].value,
  	name: $(`#name`)[0].value,
  	dorm: $(`#dorm_name`)[0].value,
  	room_no: $(`#room_no`)[0].value,
  })
  .then((result)=> {
    if(result.data=="User already exists"){
      alert("User already exists!");
      location.reload();
    }else{
      $(location).attr('href', '/signin');
    }
  })
  .catch((err)=> {alert('DB error!'); console.log(err);})
}
