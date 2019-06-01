function submitForm(e){
  e.preventDefault();
  var d = new Date();
  var useID = e.target.id.split("Submit")[0];
  axios.post('/api/history',{
    useID: useID,
    useUserID: $("#useUserID")[0].value,
    useStartTime: parseInt(d.getTime()),
    useEndTime: parseInt(d.getTime()) + (parseInt($(`#${useID}Hour`)[0].value)*60+parseInt($(`#${useID}Minute`)[0].value))*60000,
    memo: $(`#${useID}useMemo`)[0].value,
    notme: $(`#${useID}Check`).is(':checked'),
  })
  .then(updateInfo)
  .catch((err)=>{alert('DB error'); console.log(err);})
}

$("form").on("click", "button[id$='freeBtn']", (e)=> {
  e.preventDefault();
  var useID = e.target.id.split("freeBtn")[0];
  axios.put('/api/history', {
    _id: $(`#${useID}NowHistoryId`)[0].value,
    pickup: true,
  })
  .then(updateInfo)
  .catch((err)=>{alert('DB error'); console.log(err);})
});

$("form").on("click","button[id$='cancelBtn']", (e)=> {
  e.preventDefault();
  if(confirm("Cancel?")){
    var useID = e.target.id.split("cancelBtn")[0];
    axios.delete('/api/history/'+$(`#${useID}NowHistoryId`)[0].value)
    .then(updateInfo)
    .catch((err)=>{alert('DB error'); console.log(err);})
  }
});

const userPromise = async (infos) => {
  try{
    const res = await axios.get('/api/user')
    infos.userInfo = res.data;
    if(res.data == -1) {
      return -1;
    }
    return infos;
  }catch(e){
    console.log("userPromise: "+e);
  }
}

const dormPromise = async(infos) => {
  try{
    const res = await axios.get('/api/dormitory/' + infos.userInfo.dorm)
    infos.dormInfo = res.data;
    return infos;
  }catch(e){
    console.log("dormPromise: "+e);
  }
}

const infoPromise = async (infos) => {
  try{
    const res = await axios.get('/api/user/'+infos.userInfo.user_id)
    infos.totalInfo = res.data;
    return infos;
  }catch(e){
    console.log("infoPromise: "+e);
  }
}

const renderResult = async (infos) => {
  try{
    const { userInfo, dormInfo, totalInfo } = infos;
    const statusColor = {"Using": "text-danger", "Pickup Unconfirmed": "text-warning", "Available": "text-success"};

    $("#user_name")[0].innerHTML = userInfo.user_id+" "+userInfo.name;
    $("#useUserID")[0].value = userInfo.user_id;
    $("#dorm_name")[0].innerHTML = dormName[userInfo.dorm];
    const dormUL = $("#dormUL")[0];
    dormUL.innerHTML = "";
    for(let f=dormInfo.floor;f>0;f--){
      dormUL.innerHTML +=
        `
          <li class="list-group-item">
            <div class="d-flex">
              <h6 class="my-auto mr-4">${f}F</h6>
              <ul class="nav nav-pills" id="${userInfo.dorm}${f}" role="tablist">
              </ul>
            </div>
            <div class="tab-content" id="${userInfo.dorm}${f}-contents">
            </div>
          </li>
        `;
        const floorContents = $(`#${userInfo.dorm}${f}-contents`)[0];

        const renderTabContent = (f, index, name) => {
          for(let i=1; i<=index; i++){
            const machine_id = userInfo.dorm+f+name[0]+i;
            $(`#${userInfo.dorm}${f}`)[0].innerHTML +=
              `
                <li class="nav-item">
                  <a class="nav-link d-flex justify-content-between" href="#${machine_id}" data-toggle="pill" role="tab">
                  <div class="justify-content-center text-center">
                    <h6 class="my-auto">${name}${i}</h6>
                    <small class="my-auto">
                      <span class="${statusColor[totalInfo[machine_id].status]}">&#11044; </span>
                      ${totalInfo[machine_id].status}
                    </small>
                  </div>
                  </a>
                </li>
              `;
            var floorContentsHTML= "";
            floorContentsHTML +=
              `
                <div id="${machine_id}" class="list-tab-pane tab-pane fade" role="tabpanel">
                <input hidden id="${machine_id}NowHistoryId" value="${totalInfo[machine_id].now._id}"></input>
                <ul class="list-group">
              `;

            const leftHour = parseInt(new Date(Math.max(0,new Date(totalInfo[machine_id].now.sch_end_time)-new Date()))/3600000);
            const leftMin = parseInt(new Date(Math.max(0,new Date(totalInfo[machine_id].now.sch_end_time)-new Date()))/60000)-leftHour*60;

            switch(totalInfo[machine_id].status){
              case "Using":
                floorContentsHTML +=
                  `
                    <li class="list-group-item">
                      <div class="row">
                    <div class="col-md-4 my-auto">
                      Time Left
                    </div>
                    <div class="col-6 my-auto">
                      <span class="timetext" endtime="${totalInfo[machine_id].now.sch_end_time}">
                        ${leftHour.toString().padStart(2, "0")}
                        :
                        ${leftMin.toString().padStart(2, "0")}
                      </span>
                    </div>
                  `;
                if(userInfo.user_id==totalInfo[machine_id].now.user_id && leftHour + leftMin > 0){
                  floorContentsHTML +=
                  `<div class="col-6 col-md-2 my-auto">
                    <button id="${machine_id}cancelBtn" class="btn btn-danger btn-block">Cancel</button>
                  </div>`;
                }
                floorContentsHTML += "</div></li>"
                floorContentsHTML +=
                  `
                    <li class="list-group-item">
                      <div class="row">
                        <div class="col-md-4 my-auto">
                          User
                        </div>
                        <div class="col-12 col-md-6 my-auto">
                          ${totalInfo[machine_id].now.user_id} ${totalInfo[machine_id].now.user_name} (Room ${totalInfo[machine_id].now.user_room_no})
                        </div>
                      </div>
                    </li>
                    <li class="list-group-item">
                      <div class="row">
                        <div class="col-md-4 my-auto">
                          Started Time
                        </div>
                        <div class="col-12 col-md-6 my-auto">
                          ${new Date(totalInfo[machine_id].now.start_time).toLocaleString()}
                        </div>
                      </div>
                    </li>
                    <li class="list-group-item">
                      <div class="row">
                        <div class="col-md-4 my-auto">
                          Scheduled End Time
                        </div>
                        <div class="col-12 col-md-6 my-auto">
                          ${new Date(totalInfo[machine_id].now.sch_end_time).toLocaleString()}
                        </div>
                      </div>
                    </li>
                    <li class="list-group-item">
                      <div class="row">
                        <div class="col-md-4 my-auto">
                          Memo
                        </div>
                        <div class="col-12 col-md-6 my-auto">
                          ${totalInfo[machine_id].now.memo}
                        </div>
                      </div>
                    </li>
                  `;
                break;
              case "Pickup Unconfirmed":
                  floorContentsHTML +=
                    `
                      <li class="list-group-item">
                        <div class="row">
                      <div class="col-md-4 my-auto">
                        Time Left
                      </div>
                      <div class="col-5 my-auto">
                        <span class="timetext" endtime="${totalInfo[machine_id].now.sch_end_time}">
                          ${leftHour.toString().padStart(2, "0")}
                          :
                          ${leftMin.toString().padStart(2, "0")}
                        </span>
                      </div>
                    `;
                  floorContentsHTML +=
                  `<div class="col-6 col-md-3 my-auto">
                    <button id="${machine_id}freeBtn" class="btn btn-primary btn-block">Comfirm Pickup</button>
                  </div>`;
                  floorContentsHTML += "</div></li>"
                  floorContentsHTML +=
                    `
                      <li class="list-group-item">
                        <div class="row">
                          <div class="col-md-4 my-auto">
                            User
                          </div>
                          <div class="col-12 col-md-6 my-auto">
                            ${totalInfo[machine_id].now.user_id} ${totalInfo[machine_id].now.user_name} (Room ${totalInfo[machine_id].now.user_room_no})
                          </div>
                        </div>
                      </li>
                      <li class="list-group-item">
                        <div class="row">
                          <div class="col-md-4 my-auto">
                            Started Time
                          </div>
                          <div class="col-12 col-md-6 my-auto">
                            ${new Date(totalInfo[machine_id].now.start_time).toLocaleString()}
                          </div>
                        </div>
                      </li>
                      <li class="list-group-item">
                        <div class="row">
                          <div class="col-md-4 my-auto">
                            Scheduled End Time
                          </div>
                          <div class="col-12 col-md-6 my-auto">
                            ${new Date(totalInfo[machine_id].now.sch_end_time).toLocaleString()}
                          </div>
                        </div>
                      </li>
                      <li class="list-group-item">
                        <div class="row">
                          <div class="col-md-4 my-auto">
                            Memo
                          </div>
                          <div class="col-12 col-md-6 my-auto">
                            ${totalInfo[machine_id].now.memo}
                          </div>
                        </div>
                      </li>
                    `;
                break;
              case "Available":
                floorContentsHTML +=
                  `
                    <li id="${machine_id}TimeLi" class="list-group-item">
                      <div class="row">
                        <div class="col-md-4 my-auto">Required Time</div>
                        <div class="col-8 col-md-6 my-auto d-flex">
                          <input type="number" class="form-control input-sm" id="${machine_id}Hour"></input>
                          <span class="mx-1 my-auto">:</span>
                          <input type="number" class="form-control input-sm" id="${machine_id}Minute"></input>
                        </div>
                        <div class="col-4 col-md-2 my-auto custom-checkbox">
                          <input type="checkbox" class="custom-control-input" id="${machine_id}Check" name="${machine_id}CheckNotMe"></input>
                          <label class="my-auto custom-control-label" for="${machine_id}Check">Not me</label>
                        </div>
                      </div>
                    </li>
                    <li id="MemoLi" class="list-group-item">
                      <div class="row">
                        <div class="col-md-4 my-auto">Memo</div>
                        <div class="col-12 col-md-8 my-auto"><input type="text" class="form-control input-sm" id="${machine_id}useMemo"></input></div>
                      </div>
                    </li>
                    <li id="${machine_id}ButtonLi" class="list-group-item">
                      <button id="${machine_id}Submit" class="btn btn-primary btn-block" onclick="submitForm(event)">사용</button>
                    </li>
                  `
                if(totalInfo[machine_id].now.start_time!=-1){
                  floorContentsHTML +=
                    `</li>
                      <li class="list-group-item">
                        <div class="row">
                          <div class="col-md-4 my-auto">
                            User
                          </div>
                          <div class="col-12 col-md-6 my-auto">
                            ${totalInfo[machine_id].now.user_id} ${totalInfo[machine_id].now.user_name} (Room ${totalInfo[machine_id].now.user_room_no})
                          </div>
                        </div>
                      </li>
                      <li class="list-group-item">
                        <div class="row">
                          <div class="col-md-4 my-auto">
                            Started Time
                          </div>
                          <div class="col-12 col-md-6 my-auto">
                            ${new Date(totalInfo[machine_id].now.start_time).toLocaleString()}
                          </div>
                        </div>
                      </li>
                      <li class="list-group-item">
                        <div class="row">
                          <div class="col-md-4 my-auto">
                            Scheduled End Time
                          </div>
                          <div class="col-12 col-md-6 my-auto">
                            ${new Date(totalInfo[machine_id].now.sch_end_time).toLocaleString()}
                          </div>
                        </div>
                      </li>
                      <li class="list-group-item">
                        <div class="row">
                          <div class="col-md-4 my-auto">
                            Memo
                          </div>
                          <div class="col-12 col-md-6 my-auto">
                            ${totalInfo[machine_id].now.memo}
                          </div>
                        </div>
                      </li>
                    `;
                  }
                break;
              default:
                floorContentsHTML += "implementing";
                break;
            }
          }
          floorContentsHTML +=  `
          </ul>
          </div>
          `;
          return floorContentsHTML;
        }

        floorContents.innerHTML += renderTabContent(f, dormInfo.W, "Washer");
        floorContents.innerHTML += renderTabContent(f, dormInfo.D, "Drier");
    }
    return;
  }catch(e){
    console.log("renderResult: "+e);
  }
}

const loginCheckPromise = async (infos) => {
  if(infos.userInfo.user_id == -1){
    $(location).attr('href', '/signin');
    return -1;
  }else{
    return infos;
  }
}

const updateInfo = async () => {
  try{
    var infos = {userInfo: "", dormInfo: "", totalInfo: ""};
    await userPromise(infos);
    await loginCheckPromise(infos);
    if(infos.userInfo != -1){
      await dormPromise(infos);
      await infoPromise(infos);
      await renderResult(infos);
    }
  }catch(e){
    alert('Rendering Error. Please refresh');
    console.log(e);
  }
}

updateInfo();
