var socket = io();

var _username;
var _password;
var _toName;
var _cilent={};


function TurnToRegister(){
    $('#login_container').hide();
    $('#register_container').show();
    reset();
}
function TurnToLogin(){
    $('#register_container').hide();
    $('#login_container').show();
    reset();
}

function setupSocket() {
    socket.off('login');
    socket.off('register');
    socket.off('loginFail');  // 移除之前绑定的 'loginFail' 事件监听器
    socket.off('loginSuccess');  // 移除之前绑定的 'loginSuccess' 事件监听器
    socket.off('registerFail');
    socket.off('registerSuccess');
}

function reset(){
    document.getElementById("username").value="";
    document.getElementById("password").value="";
    document.getElementById("new-username").value="";
    document.getElementById("new-password").value="";
}
//登录
function login(){
    this._username = document.getElementById('username');
    this._password = document.getElementById('password');

    if(_username.value == ''){
        alert('请输入用户名');
        return ;
    }
    if(_password.value  ==''){
        alert('请输入密码');
        return ;
    }

    this._cilent.username = this._username.value.trim();
    this._cilent.password = this._password.value.trim();
    _toName = this._cilent.username;

    socket.emit('login',_cilent);
    setupSocket();
    socket.on('loginSuccess',cilents=>{
        //隐藏登录窗口
        $('.container').hide();
        // 显示聊天窗口
        $('.chat_container').fadeIn();
        reset();
        document.getElementById('name_user').textContent = this._cilent.username;
        updataUser(cilents);
        document.getElementById('userCell_'+this._cilent.username).click();

    });

    //socket.off('loginFail');
    socket.on('loginFail',data=>{
        alert(data);
        reset();
        //data=null;
    });

}

//注册
function register () {
    this._username = document.getElementById('new-username');
    this._password = document.getElementById('new-password');

    if(_username.value == ''){
        alert('请输入用户名');
        return ;
    }
    if(_password.value  ==''){
        alert('请输入密码');
        return ;
    }
    this._cilent.username = this._username.value.trim();
    this._cilent.password = this._password.value.trim();
    _toName = this._cilent.username;
    socket.emit('register',_cilent);

    setupSocket();
    socket.on('registerSuccess',data => {
        alert(data);
        $('#register_container').hide();
        $('#login_container').fadeIn();
        reset();
    });

    //socket.off('registerFail');
    socket.on('registerFail',data=>{
        alert(data);
        reset();
    });

}

// 当有消息时，将滑动到底部
function scrollIntoView (myChatId) {
    // 当前元素的底部滚动到可视区
    $('#'+myChatId).children(':last').get(0).scrollIntoView(false)
}

socket.on('updataUser',cilents=>{
    updataUser(cilents);
})

function updataUser(cilents){
    var cells = document.getElementsByClassName('userCell');

    for(let i=0;i<cells.length;i++){
        let flag = false;
        for(let j=0;j<cilents.length;j++){
            if(cells[i].textContent == cilents[j]){
                flag = true;
            }
        }
        if(!flag){
            //document.getElementById(cells[i].id).style.display = 'none';
            //$(cells[i].id).remove();
            let t_cell = document.getElementById(cells[i].id);
            t_cell.parentNode.removeChild(t_cell);
        }
    }

    for(let i=0;i<cilents.length;i++){
        let flag = false;
        for(let j = 0; j<cells.length;j++){
            if(cilents[i] == cells[j].textContent){
                flag = true;
            }
        }
        //如果不在添加到表里
        if(!flag){
            //左侧创建一个用户块
            var cell = createUserCell(cilents[i]);
            cell.classList.add('userCell');
            document.getElementById('list_user').appendChild(cell);
            cell.id='userCell_'+cilents[i];

            //创建聊天块
            var chatDiv = document.createElement('div');
            chatDiv.classList.add('chat');
            chatDiv.id = 'chat_'+cilents[i];
            chatDiv.style = chatStyle;
            chatDiv.style.display = 'none';
            document.getElementById('_chatList').appendChild(chatDiv);

            console.log(cell.id);
            //设置点击事件
            $('.'+cell.className).on("click",function(){
                document.getElementById('name_user').textContent = $(this).context.innerText;
                _toName = $(this).context.innerText;
                //点击时改变格式
                changeUserCell($(this).context.innerText);
                //切换聊天块
                var divs = document.getElementsByClassName('chat');
                for(let i=divs.length-1 ; i>=0;i--){
                    if(divs[i].id == 'chat_' + _toName){
                        divs[i].style.display = 'inline';
                    }else{
                        divs[i].style.display = 'none';
                    }
                }
                scrollIntoView('chat_' + _toName);
            });
        }
    }
}

//点击发送
function send(){
    var _text_view = document.getElementById('_text_view');
    if(_text_view.innerHTML.length == 0 || document.getElementById('name_user').textContent ==0){
        return;
    }

    var _chatDiv = document.getElementById('chat_'+_toName);
    var myinfoDiv = document.createElement('div');
    myinfoDiv.classList.add('chatInfo');
    myinfoDiv.style = myinfoStyle;
    myinfoDiv.textContent = _cilent.username +' '+ formatDateTime(new Date());
    _chatDiv.appendChild(myinfoDiv);

    var myselfDiv = document.createElement('div');
    myselfDiv.classList.add('chatInfo');
    myselfDiv.style = myselfStyle;

    myselfDiv.innerHTML = _text_view.innerHTML;
    _text_view.innerHTML = '';
    _chatDiv.appendChild(myselfDiv);
    scrollIntoView('chat_'+_toName);

    socket.emit('sendMessage',{
        msg: myselfDiv.innerHTML,
        name: _cilent.username,
        time: formatDateTime(new Date()),
        toName: document.getElementById('name_user').textContent
    });

}

//接受信息
socket.on('receiveMessage', data=>{
    //console.log(data);
    //console.log(JSON.stringify(data));

    var _chatDiv = document.getElementById('chat_'+data.fromName);
    var hisinfoDiv = document.createElement('div');
    hisinfoDiv.classList.add('hischatInfo');
    hisinfoDiv.style = hisinfoStyle;
    hisinfoDiv.textContent = data.fromName +' '+ data.time;
    _chatDiv.appendChild(hisinfoDiv);

    var hisMsgDiv = document.createElement('div');
    hisMsgDiv.classList.add('hischatInfo');
    hisMsgDiv.style = hisMsgStyle;

    hisMsgDiv.innerHTML = data.msg;
    _chatDiv.appendChild(hisMsgDiv);
    scrollIntoView ('chat_'+data.fromName);
});

//从服务器下载聊天记录
function getHistory(){
    //$.post("http://127.0.0.1:3000/download",{name : _username,toName: _toName});
    //window.location.href='http://127.0.0.1:3000/'+url;
    //$.get('http://127.0.0.1:3000/download',{name:this._cilent.username,'toName':_toName});
    let url='http://127.0.0.1:3000/download?name='+this._cilent.username+'&toName='+_toName;
    //window.open(url);
    downloadByIframe(url);
}

// 发送图片功能
function sendImage(){
    var imageFile = document.getElementById('_picture').files[0];

    var fr = new window.FileReader()
    fr.readAsDataURL(imageFile);
    fr.onload = function () {
        socket.emit('sendImage',{
            image:fr.result,
            name:_cilent.username,
            time : formatDateTime(new Date()),
            toName:document.getElementById('name_user').textContent
        })

    //自己的聊天框显示内容
    var _chatDiv = document.getElementById('chat_'+_toName);
    var myinfoDiv = document.createElement('div');
    myinfoDiv.classList.add('chatInfo');
    myinfoDiv.style = myinfoStyle;
    myinfoDiv.textContent = _cilent.username +' '+ formatDateTime(new Date());
    _chatDiv.appendChild(myinfoDiv);

    var myselfDiv = document.createElement('div');
    myselfDiv.classList.add('chatInfo');
    myselfDiv.classList.add('chatImage');
    myselfDiv.style = myselfStyle;

    myselfDiv.innerHTML ='<img src=\"'+ fr.result +'\">';
    _chatDiv.appendChild(myselfDiv);
    scrollIntoView('chat_'+_toName);
    }
}

//接受图片
socket.on('receiveImage', data=>{
    console.log(data);

    var _chatDiv = document.getElementById('chat_'+data.fromName);
    var hisinfoDiv = document.createElement('div');
    hisinfoDiv.classList.add('hischatInfo');
    hisinfoDiv.style = hisinfoStyle;
    hisinfoDiv.textContent = data.fromName +' '+ data.time;
    _chatDiv.appendChild(hisinfoDiv);

    var hisMsgDiv = document.createElement('div');
    hisMsgDiv.classList.add('hischatInfo');
    hisMsgDiv.classList.add('hischatImage');
    hisMsgDiv.style = hisMsgStyle;

    hisMsgDiv.innerHTML = '<img src=\"'+ data.image +'\">';
    _chatDiv.appendChild(hisMsgDiv);
    scrollIntoView ('chat_'+data.fromName);
});

//从本地获取聊天记录
function readHistory(){
    var history = document.getElementById('_history').files[0];

    var fr = new window.FileReader()
    fr.readAsDataURL(history);
    fr.onload = function () {
        //console.log(Base64.decode(fr.result));
        //编码base64 Base64.encode
        //解码base64
        var texts = Base64.decode(fr.result).match(/{(.*?)}/g);
        //console.log(texts);
        var t_meg = JSON.parse(texts[0]);
        console.log(t_meg);
        if(t_meg.name != _cilent.username && t_meg.toName != _cilent.username){
            alert('这不是你的聊天记录！！！');
            return ;
        }

        for(let i=0;i<texts.length;i++){
            var notes = JSON.parse(texts[i]);
            //如果是自己发的消息
            if(notes.name == _cilent.username){
                var _chatDiv = document.getElementById('chat_'+_toName);
                var myinfoDiv = document.createElement('div');
                myinfoDiv.classList.add('chatInfo');
                myinfoDiv.style = myinfoStyle;
                myinfoDiv.textContent = _cilent.username +' '+ formatDateTime(new Date());
                _chatDiv.appendChild(myinfoDiv);
                var myselfDiv = document.createElement('div');
                myselfDiv.style = myselfStyle;
                //是消息还是图片
                if(notes.msg == undefined){
                    myselfDiv.classList.add('chatImage');
                    myselfDiv.innerHTML = '<img src=\"'+ notes.image +'\">';
                }else{
                    myselfDiv.classList.add('chatInfo');
                    myselfDiv.innerHTML = notes.msg;
                }
                _chatDiv.appendChild(myselfDiv);
                scrollIntoView ('chat_'+_toName);
            }else{  //如果发给自己的消息
                var _chatDiv = document.getElementById('chat_'+notes.name);
                var hisinfoDiv = document.createElement('div');
                hisinfoDiv.classList.add('hischatInfo');
                hisinfoDiv.style = hisinfoStyle;
                hisinfoDiv.textContent = notes.name +' '+ notes.time;
                _chatDiv.appendChild(hisinfoDiv);

                var hisMsgDiv = document.createElement('div');
                hisMsgDiv.style = hisMsgStyle;

                //是消息还是图片
                if(notes.msg == undefined){
                    hisMsgDiv.classList.add('hischatImage');
                    hisMsgDiv.innerHTML = '<img src=\"'+ notes.image +'\">';
                }else{
                    hisMsgDiv.classList.add('hischatInfo');
                    hisMsgDiv.innerHTML = notes.msg;
                }
                _chatDiv.appendChild(hisMsgDiv);
                scrollIntoView ('chat_'+notes.name);
            }
        }
    }
}
