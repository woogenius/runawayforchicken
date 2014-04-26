'use strict';

angular.module('rafc.controllers', [])
  .controller('MainCtrl', ['$scope', '$rootScope', '$window', '$location', function ($scope, $rootScope, $window, $location) {
      $rootScope.socket = io.connect();
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
          $rootScope.userdata.winNumber = 0;
          $rootScope.userdata.loseNumber = 0;
          $rootScope.userdata.winningStreak = 0;
        });
        $location.url(path);
        socket.emit('login', {name : $scope.user.name, whoareyou: $scope.user.whoareyou});
      }
  }])

  .controller('MainPageCtrl', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
      var socket = $rootScope.socket;
      $scope.messages = [];
      $scope.message = "";
      $scope.cno = 0;
      $scope.userdata = $rootScope.userdata;
      socket.on("message", function(data) {
        $('#chatbox').append("<li>"+data.id+ " : " +data.data+"</li>");
        $("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
      });

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
      $scope.rno = $routeParams.rno;
      $scope.uno = $routeParams.uno;
  }])
