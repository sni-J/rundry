const EngToKo = {"somang": "소망관"};
const KoToEng = {"소망관": "somang"};

const logout = () => {
  if(confirm("Log out?")){
    window.localStorage.removeItem('token');
    window.location.href = '/main';
  }
}
