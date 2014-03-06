define(function(require) {
    'use strict';

    var angular = require('angular'),
        appController = require('js/app-controller'),
        keychain, pgp;

    //
    // Controller
    //

    var ContactsCtrl = function($scope) {
        keychain = appController._keychain,
        pgp = appController._crypto;

        $scope.state.contacts = {
            open: true,
            toggle: function(to) {
                this.open = to;
                $scope.listKeys();
            }
        };

        //
        // scope functions
        //

        $scope.listKeys = function() {
            keychain.listLocalPublicKeys(function(err, keys) {
                if (err) {
                    $scope.onError(err);
                    return;
                }

                $scope.keys = keys;
                $scope.$apply();
            });
        };

        $scope.importKey = function(publicKeyArmored) {
            var pubkey = {
                _id: pgp.getKeyId(publicKeyArmored),
                userId: pgp.getUserId(publicKeyArmored).split('<')[1].split('>')[0],
                publicKey: publicKeyArmored
            };

            keychain.saveLocalPublicKey(pubkey, function(err) {
                if (err) {
                    $scope.onError(err);
                    return;
                }

                // update displayed keys
                $scope.listKeys();
            });
        };

        $scope.removeKey = function(key) {
            keychain.removeLocalPublicKey(key._id, function(err) {
                if (err) {
                    $scope.onError(err);
                    return;
                }

                // update displayed keys
                $scope.listKeys();
            });
        };

        $scope.listKeys();
    };

    //
    // Directives
    //

    var ngModule = angular.module('contacts', []);

    ngModule.directive('keyfileInput', function() {
        return function(scope, elm) {
            elm.on('change', function(e) {
                for (var i = 0; i < e.target.files.length; i++) {
                    importKey(e.target.files.item(i));
                }
            });

            function importKey(file) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    scope.importKey(e.target.result);
                };
                reader.readAsText(file);
            }
        };
    });

    ngModule.directive('keyfileBtn', function() {
        return function(scope, elm) {
            elm.on('click touchstart', function(e) {
                e.preventDefault();
                document.querySelector('#keyfile-input').click();
            });
        };
    });

    return ContactsCtrl;
});