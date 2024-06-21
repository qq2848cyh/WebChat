const { data } = require('jquery');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const PORT = 3000;
var express = require('express');

const url = require('url');
const fs = require('fs');


var mysql = require('mysql');
const { Console } = require('console');
const { query } = require('express');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'aa123456',
  database : 'test'
});

//存储的是只有名称
const _cilents=[];

app.use(require('express').static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', function(req, res){
  res.redirect('index.html')
});

app.get('/download', function(req, res) {
  let url = 'history/'+ req.query.name + 'To' + req.query.toName + '.txt';
  res.download(__dirname+'\\'+url);
});

io.on('connection', function(socket){
//  console.log('a user connected');
  socket.on('login',function(data){
    //寻找以前是否登陆过
    var t_cilent = _cilents.find(item => item == data.username);
    if(t_cilent){
      socket.emit('loginFail','该用户已经登录');
      return ;
    }
    //从数据库中寻找
    select_user(data,result=>{
      if(result.length){
        if(result[0].password != data.password){
          socket.emit('loginFail','密码错误!');
          return ;
        }
      }else{
        socket.emit('loginFail','用户不存在!');
        return ;
      }

      //记录已经登录的用户
      _cilents.push(data.username);

      socket.emit('loginSuccess',_cilents);

      //全局广播,来了新用户
      io.emit('updataUser', _cilents);
      socket.username = data.username;
    })
  });

  socket.on('register',function(data){
    insert_user(data,result=>{
      if(result==false){
        socket.emit('registerFail','注册失败!');
        return ;
      }
      else if(result!=null){
        socket.emit('registerSuccess','注册成功!');
        return ;
      }
    })

  });

  // 用户断开连接的功能
  socket.on('disconnect', () => {
    // 把当前用户的信息删除
    const idx =_cilents.findIndex(item => item == socket.username)

    //删除函数
    _cilents.splice(idx, 1);
    // 告诉所有人，用户发生更新
    //console.log(_cilents);
    io.emit('updataUser', _cilents)
  });


  socket.on('sendMessage',data=>{
    var toSocket = null
    for (const key in io.sockets.sockets) {
      if (io.sockets.sockets[key].username == data.toName) {
        toSocket = key
        break
      }
    }
    if (toSocket) {
      // 发送给指定用户
      socket.to(toSocket).emit('receiveMessage', {
        msg:data.msg,
        fromName:data.name,
        time : data.time,
        name:data.toName
      })
    }

    //将数据存入文件中
    let url = './history/'+data.name+'To'+data.toName+'.txt';
    fs.appendFile(url,'\n'+JSON.stringify(data), err => {if (err) {console.log(err)}});
    if(data.toName != data.name){
      let t_url = './history/'+data.toName+'To'+data.name+'.txt';
      fs.appendFile(t_url,'\n'+JSON.stringify(data), err => {if (err) {console.log(err)}});
    }

  });

  socket.on('sendImage',data=>{
    var toSocket = null
    //console.log(io.sockets.sockets)
    for (const key in io.sockets.sockets) {
      if (io.sockets.sockets[key].username == data.toName) {
        toSocket = key
        break
      }
    }
    //console.log(data);
    if (toSocket) {
      // 发送给指定用户
      socket.to(toSocket).emit('receiveImage', {
        image:data.image,
        fromName:data.name,
        time : data.time,
        name:data.toName
      })
    }

    //将数据存入文件中
    let url = './history/'+data.name+'To'+data.toName+'.txt';
    fs.appendFile(url,'\n'+JSON.stringify(data), err => {if (err) {console.log(err)}});
    if(data.toName != data.name){
      let t_url = './history/'+data.toName+'To'+data.name+'.txt';
      fs.appendFile(t_url,'\n'+JSON.stringify(data), err => {if (err) {console.log(err)}});
    }
  })

});


http.listen(PORT, function(){
  console.log('http://127.0.0.1:'+PORT+'/');
});

//从数据库中查询
function select_user(data,callback){
  //连接数据库开始查询
  let sql = 'SELECT * FROM user where id = \''+data.username+'\';';
  connection.query(sql,function (err, result) {
    if(err){
      console.log('[SELECT ERROR] - ',err.message);
      callback(null)
    }
    //用回调函数告诉调用者执行完了
    callback(result);
  });
}
//插入数据库
function insert_user(data,callback){
  let sql ='INSERT INTO user VALUES (\''+data.username+'\',\''+data.password+'\');';
  connection.query(sql,(err,result)=>{
    if(err){
      console.log('[INSERT ERROR] - ',err.message);
      callback(false);
    }
    callback(result);
  });
}



