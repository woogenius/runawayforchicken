'use strict';

angular.module('rafc.controllers', [])
  .controller('MainCtrl', ['$scope', '$rootScope', '$window', '$location', function ($scope, $rootScope, $window, $location) {
      $rootScope.socket = io.connect();
      $rootScope.count = 0;
      var socket = $rootScope.socket;
      $scope.user = {};
      $rootScope.go = function(path){
        $location.url(path);
      }
      $scope.login = function(path) {
        if(!$('#name').val()) {
          return;
        }

        socket.on('moveMainPage', function(data) {
          $rootScope.userdata = data;
          $rootScope.prevWin = false;
          $rootScope.userdata.winNumber = 0;
          $rootScope.userdata.loseNumber = 0;
          $rootScope.userdata.winningStreak = 0;
        });
        $location.url(path);
        socket.emit('login', {name : $scope.user.name, whoareyou: $scope.user.whoareyou});
      }

      socket.on('count', function(data) {
        $rootScope.count = data.count;
      });

      socket.on("message", function(data) {
        $('#chatbox').append("<li>"+data.id+ " : " +data.data+"</li>");
        $("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
      });

  }])

  .controller('MainPageCtrl', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
      var socket = $rootScope.socket;
      $scope.messages = [];
      $scope.message = "";
      $scope.userdata = $rootScope.userdata;

      $scope.submitMessage = function() {
        socket.emit("message", {id:$scope.userdata.name, data:$scope.message});
        $('#chatMessage').val("");
      };

      $('#chatMessage').keydown(function(event){
        if(event.keyCode===13){
          $scope.submitMessage();
          return false;
        }
      });
      var ready = true;
      var isFirst = false;
      $scope.ready = function() {
        $('#ready').toggleClass('readyActive');
        if (ready) {
          $('#ready').text('Readied!');
          socket.emit("ready", {ready:ready});
          $('#loader').toggleClass('hidden');
          console.log("emit ready!");
        } else{
          isFirst = false;
          $('#ready').text('Ready!');
          socket.emit("cancelReady", {ready:ready});
          $('#loader').toggleClass('hidden');
          console.log("emit cancelReady!");
        };
        ready = !ready;
      }

      socket.on('waitGame', function(data) {
        isFirst = true;
        console.log("매칭상대 대기중");
      });

      socket.on('moveGame', function(data) {
        var rno = data.roomNumber;
        $scope.$apply( function() {
          if (isFirst) {
            $location.path('/game/'+rno+'/'+"1");
          } else{
            $location.path('/game/'+rno+'/'+"2");
          };
        });
      });

  }])
    
  .controller('GameCtrl', ['$scope', '$rootScope', '$routeParams', '$location', function ($scope, $rootScope, $routeParams, $location) {
      var socket = $rootScope.socket;
      var rno = $routeParams.rno;
      var pno = $routeParams.uno;

          var playerNumber = pno;
    var roomNumber = rno;
        window.addEventListener("keydown", key_down, false);

    function key_down(e) {
      if (e.keyCode == "32" && flag_ground == 0) {
        e.preventDefault();
        char_y -= 20;
        g = pow_jump;
      }

      if(e.keyCode == "37" && run_mode == 0){
        run_mode = 1;
        speed += 0.8;
      }

      if(e.keyCode == "39" && run_mode == 1){
        run_mode = 0;
        speed += 0.8;
      }
    }

    var canvas;
    var context; 

    var img_char = new Image();
    var img_back = new Image();
    var img_num = new Image();
    var img_key = new Image();
    var img_meter = new Image();
    var img_tile = new Image();
    var img_chicken = new Image();
    var page_end = new Image();
    var page_win = new Image();


    /* character option */
    var char_y;
    var speed;
    var pow_jump;
    var run_mode = 0;
    var state;

    var g;
    var g_acc;

    /* map option */
    var map_data;
    var map_left;

    /* chicken option */
    var chic_y;

    /* view option */
    var view_score;
    var view_charY;

    var flag_ground;

    var instance;
 
    var cnt_char;
    var cnt_key;
    var cnt_chic;
    var gameLoop;
 
    function game(){
      canvas = document.getElementById('myCanvas');
      context = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = 400;

      img_char.src = "./img/char.png";
      img_num.src = "./img/number.png";
      img_key.src = "./img/keyboard.png"
      img_back.src = "./img/background.png";
      img_meter.src = "./img/meter.png"
      img_tile.src = './img/tile.png';
      img_chicken.src = './img/chicken.png';
      page_win.src = './img/page_win.png';
      page_end.src = './img/page_lose.png';

      map_data = new Array();

      for(var i = 0; i < 200; i++){
        if(i < 30){
          map_data[i] = 1;
        }else if(i < 34){
          map_data[i] = 0;
        }else if(i < 80){
          map_data[i] = 1;
        }else if(i < 86){
          map_data[i] = 0;
        }else if(i < 120){
          map_data[i] = 1;
        }else if(i < 125){
          map_data[i] = 0;
        }else if(i < 129){
          map_data[i] = 1;
        }else if(i < 134){
          map_data[i] = 0;
        }else{
          map_data[i] = 1;
        }
        
      }

      g_acc = 1.5;
      pow_jump = -18;
      view_score = 0;
      view_charY = 0;

      state = 1;
      
      init();

      debugger;
      gameLoop = setInterval(update, 33);

      if(playerNumber == 1){
        socket.on("score2", function(data){
          //console.log(data.score);
          view_score = data.score;
          view_charY = data.y;
        });
      }
      else {
        socket.on("score1", function(data){
          //console.log(data.score);
          view_score = data.score;
          view_charY = data.y;
        });
      }


    }
 
    function init(){
      map_left = 0;

      flag_ground = 0;
      instance = 0;
      cnt_char = 0;
      cnt_key = 0;
      cnt_chic = 0;
      state = 1;

      view_score = 0;
      view_charY = 0;

      char_y = 0;

      speed = 0;

      g = 0;
    }
 
    function update(){
      //console.log(map_left);
      socket.emit("score", {score: map_left, y: char_y, roomNumber: rno, playerNumber: pno});

      if(state == 1){
        if(speed > 0){
          speed -= 0.2;
        }else{
          speed = 0;
        }

        if(map_data[parseInt((-1 * map_left + 100) / img_tile.width) + 1] == 0){
          flag_ground = 1;
        }else{
          flag_ground = 0;
        }

        g += g_acc;
        if(flag_ground == 0
         && char_y + 298 > img_back.height - img_tile.height + 31
         && char_y + 298 < img_back.height - img_tile.height + 60){
          g = 0;
        }
        char_y += g;

        if(char_y > 850){
          char_y = 0;
          g = 0;
          speed = 0;
          map_left -= img_tile.width * 2;
        }
   
        cnt_char++;
        if(cnt_char >= 13){
          cnt_char = 0;
        }
   
        cnt_key++;
        if(cnt_key > 8){
          cnt_key = 0;
        }

        if(cnt_chic <= 20){
          chic_y = Math.abs(10 - cnt_chic);
        }else{
          cnt_chic = 0;
        }
        cnt_chic ++;

        if(parseInt((-1 * view_score) / 14.8) > 900){
          debugger;
          state = 2;
        }else if(parseInt((-1 * map_left) / 14.8) > 900){
          state = 3;
        }


        map_left -= speed;
      }

      draw();
    }

    function draw(){
      context.clearRect(0, 0, 800, 800);
      if(state == 1){
        context.drawImage(img_back, map_left / 37.5, 0);

        for(var i = 0; i < map_data.length; i++){
          if(map_data[i] == 1){
            context.drawImage(img_tile, map_left + img_tile.width * i, img_back.height - img_tile.height);
          }
        }
   
        printNumber(parseInt((-1 * map_left) / 14.8), 710, 5);
   
        context.drawImage(img_key, cnt_key % 8 * 193, 0, 193, 74, 100, 20, 193, 74);
        context.globalAlpha = 0.3;
        context.drawImage(img_char, (cnt_char % 7) * 268, (cnt_char < 7) ? 0:298, 268, 296, 100 - (view_score - map_left), view_charY, 268, 298);
        context.globalAlpha = 1;
        context.drawImage(img_char, (cnt_char % 7) * 268, (cnt_char < 7) ? 0:298, 268, 296, 100, char_y, 268, 298);
        context.drawImage(img_chicken, 480, 80 + chic_y);
      }else if(state == 2){
        context.drawImage(page_end, 0, 0);
        clearInterval(gameLoop);
        $scope.state = 2;
      }else if(state == 3){
        context.drawImage(page_win, 0, 0);
        clearInterval(gameLoop);
        $scope.state = 3;
      }
      
    }
 
    function printNumber(number, x, y){
      var num = number;
      var initx = x;
      var count = num.toString().length;
      
      while(count > 0){
        initx -= 29;
        context.drawImage(img_num,
          parseInt(num%10) * 67, 0, 67, 73,
          initx, y, 67, 73);
        num = num/10;
        count--;
      }
 
      context.drawImage(img_meter, x + 4, y + 12);
      
    }


    game();



    $scope.toMainPage = function () {
      if ($scope.state == 2) {
        $rootScope.userdata.loseNumber++;
        $rootScope.userdata.prevWin = false;
        $rootScope.userdata.winningStreak = 0;
      } else{
        $rootScope.userdata.winNumber++;
        $rootScope.userdata.winningStreak++;
        $rootScope.userdata.prevWin = true;
      };
      
      $location.url('/main');
    }







  }])

