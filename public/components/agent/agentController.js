angular.module('app')
.controller('agentController', ['$scope', '$document', 'Socket', 'Session', '$state', '$timeout', '$http', function($scope, $document, Socket, Session, $state, $timeout, $http) {
    
    $scope.user = Session.user.username;

    $scope.disconnect = function() {
            Socket.emit('logout',{},function(){
                console.log("Logged out from server");
            })
            Session.user = '';
            $http.get('/logout').then(function(res){
            $state.go('login')
            console.log("LOGGED OUT")});
    }
    $scope.sendMessage = function(text) {

            var timestamp = moment().valueOf();
            var momentTime = moment.utc(timestamp);
                momentTime = momentTime.local().format('h:mm a');

            if(!angular.isUndefined(text)) {

            var newMessage = {
                sender: $scope.user,
                receiver: 'Admins',
                message: text,
                time: momentTime
                
            }
            Socket.emit("chatMessage", newMessage, function(response) {
                if (response == 'success') {
                    $scope.messages.push(newMessage)
                    $scope.messageInput = "";
                    $timeout(() => {
                        var container = document.getElementById('messageContainer');
                        container.scrollTop = container.scrollHeight - container.clientHeight;
                    });
                }
            });
        }
    }
    $scope.getMessages = function() {
        Socket.emit('getMessages', {}, function(messages) {
            console.log('Messages:', messages)
            $scope.messages = messages;
            $timeout(() => {
                var container = document.getElementById('messageContainer');
                if (container) {
                    container.scrollTop = container.scrollHeight - container.clientHeight;
                }
            });
        })
    }
    $scope.getMessages();
    Socket.on('chatMessage', function(message) {
        console.log("INCOMING MSG::",message);
        $scope.messages.push(message.data);
        $timeout(() => {
            var container = document.getElementById('messageContainer');
            container.scrollTop = container.scrollHeight - container.clientHeight;
        });
    })
}])