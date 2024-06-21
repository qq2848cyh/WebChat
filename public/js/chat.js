var chatStyle =
    "height: 65%;\
    background-color: #eeeeee;\
    padding-left: 5px;\
    padding-right: 5px;\
    padding-bottom: 5px;\
    overflow-y:auto; ";

var myinfoStyle = "color: green;clear:both;float: right;"
var myselfStyle =
                "background-color:cornflowerblue;\
                border-radius: 5px;\
                padding: 5px;\
                color: white;\
                text-align: center;\
                width:auto;\
                cursor:text;\
                border: none;\
                resize: none;\
                outline:none;\
                clear:both;\
                float: right;";

var hisinfoStyle = "color: blue;clear:both;float: left;";

var hisMsgStyle =
                "background-color:rgb(205, 205, 205);\
                border-radius: 5px;\
                padding: 5px;\
                text-align: center;\
                width:auto;\
                cursor:text;\
                border: none;\
                resize: none;\
                outline:none;\
                clear:both;\
                float: left;";

var userCellStyle =
                "clear:both;\
                padding: 10px;\
                border-color: black;\
                border-style: solid;\
                cursor:pointer;\
                text-align: center;\
                background-color : transparent;";

var userCellClickStyle =
                "clear:both;\
                padding: 10px;\
                border-color: black;\
                border-style: solid;\
                cursor:pointer;\
                text-align: center;\
                background-color : lightgray;";

//本方法copy自网络
var formatDateTime = function (date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h=h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    var second=date.getSeconds();
    second=second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;
}

function createUserCell(str){
    var cell = document.createElement('div');
    cell.textContent = str;
    cell.style=userCellStyle;
    return cell;
}

function changeUserCell(username){
    var PRE = 'userCell_';
    var cell = document.getElementById(PRE + username);
    var cells = document.getElementsByClassName('userCell');
    for(let i=0;i<cells.length;i++){
        if(cells[i].id != cell.id){
            cells[i].style = userCellStyle;
        }
    }
    cell.style=userCellClickStyle;
}

//本方法copy自网络
function downloadByIframe(url){
    var iframe = document.getElementById("myIframe");
    if(iframe){
        iframe.src = url;
    }else{
        iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = url;
        iframe.id = "myIframe";
        document.body.appendChild(iframe);
    }
}
