const EngToKo = {"somang": "소망관", "sarang": "사랑관", "seongsil":"성실관"};

const logout = () => {
  if(confirm("Log out?")){
    window.localStorage.removeItem('token');
    window.location.href = '/main';
  }
}
