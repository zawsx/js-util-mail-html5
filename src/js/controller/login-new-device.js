define(function(require) {
    'use strict';

    var angular = require('angular'),
        errorUtil = require('js/util/error'),
        appController = require('js/app-controller');

    var LoginExistingCtrl = function($scope, $location) {
        // global state... inherited to all child scopes
        $scope.$root.state = {};
        // attach global error handler
        errorUtil.attachHandler($scope);

        var emailDao = appController._emailDao;

        $scope.incorrect = false;
        $scope.key = {};
        $scope.key.privateKeyArmored = '-----BEGIN PGP PRIVATE KEY BLOCK-----\r\n' +
            'Version: OpenPGP.js v.1.20131116\r\n' +
            'Comment: Whiteout Mail - http://whiteout.io\r\n' +
            '\r\n' +
            'xcL+BFKODs4BB/9iOF4THsjQMY+WEpT7ShgKxj4bHzRRaQkqczS4nZvP0U3g\r\n' +
            'qeqCnbpagyeKXA+bhWFQW4GmXtgAoeD5PXs6AZYrw3tWNxLKu2Oe6Tp9K/XI\r\n' +
            'xTMQ2wl4qZKDXHvuPsJ7cmgaWqpPyXtxA4zHHS3WrkI/6VzHAcI/y6x4szSB\r\n' +
            'KgSuhI3hjh3s7TybUC1U6AfoQGx/S7e3WwlCOrK8GTClirN/2mCPRC5wuIft\r\n' +
            'nkoMfA6jK8d2OPrJ63shy5cgwHOjQg/xuk46dNS7tkvGmbaa+X0PgqSKB+Hf\r\n' +
            'YPPNS/ylg911DH9qa8BqYU2QpNh9jUKXSF+HbaOM+plWkCSAL7czV+R3ABEB\r\n' +
            'AAH+AwMI8l5bp5J/xgpguvHaT2pX/6D8eU4dvODsvYE9Y4Clj0Nvm2nu4VML\r\n' +
            'niNb8qpzCXXfFqi1FWGrZ2msClxA1eiXfk2IEe5iAiY3a+FplTevBn6rkAMw\r\n' +
            'ly8wGyiNdE3TVWgCEN5YRaTLpfV02c4ECyKk713EXRAtQCmdty0yxv5ak9ey\r\n' +
            'XDUVd4a8T3QMgHcAOTXWMFJNUjeeiIdiThDbURJEv+9F+DW+4w5py2iw0PYJ\r\n' +
            'Nm6iAHCjoPQTbGLxstl2BYSocZWxG1usoPKhbugGZK0Vr8rdpsfakjJ9cJUg\r\n' +
            'YHIH3VT+y+u5mhY681NrB5koRUxDT6ridbytMcoK8xpqYG3FhC8CiVnzpDQ3\r\n' +
            'o1KRkWuxUq66oJhu0wungXcqaDzDUEfeUjMuKVI/d9/ViXy8IH/XdlOy0lLY\r\n' +
            'Oac0ovRjb7zgeVOp2e7N4eTu0dts3SE+Do1gyqZo2rf1dwsJQI9YUtpjYAtr\r\n' +
            'NBkKyRvBAhg9KPh1y2Y1u3ra5OS0yGuNDD8pXdiN3kxMt5OBlnWeFjL6ll7+\r\n' +
            'vgiKZooPUZPbFIWi4XBXTv7D5T9THDYmuJpcOffn1AA7j2FM8fkFvtiFyw9J\r\n' +
            '2S14penv2R7TeybxR6ktD7HtZd34gmGvmOxhWRNU/vfp4SisUcu9jzQq+cJt\r\n' +
            'joWuJiZ8xvWEC2DD32n9bWyIlGhS4hATqz/gEdSha8hxzT+GJi29jYjp8Hnc\r\n' +
            '9HwxOArz6Q5h/nDN2Xt5PuCM65J0dathzAm0A7BLRQI+4OjTW575sRKvarzH\r\n' +
            '8JZ+UYK2BgP4Kbh9JqhnD/2NKD/csuL6No5guyOH8+zekdBtFE394SV8e9N+\r\n' +
            'zYgzVex4SDG8y/YO7W7Tp6afNb+sqyzEw5Bknypn0Hc3cr9wy1P8jLMM2woL\r\n' +
            'GRDZ5IutCAV/D/h881dHJs0tV2hpdGVvdXQgVXNlciA8c2FmZXdpdGhtZS50\r\n' +
            'ZXN0dXNlckBnbWFpbC5jb20+wsBcBBABCAAQBQJSjg7aCRDX+5P837/CPAAA\r\n' +
            '3ZwH/2AVGYB+8RDarP5a5uZPYSxJKeM8zHMbi7LKQWhr5NpkJajZdra1CCGZ\r\n' +
            'TXTeQSRBvU4SNGOmDAlhf0qCGeXwMHIzrzovkBedHIc/vypEkItdJeXQAaJx\r\n' +
            'uhQOnmyi9priuzBBx4e9x1aBn+aAdNGiJB4l13L2T4fow8WLIVpVwXB6BWya\r\n' +
            'lz50JwLzJP6qHxkhvIZElTrQ+Yoo3stS6w/7wNtK/f3MIYkIGVVUrIDgzN0X\r\n' +
            'm4z6ypN1dsrM6tPkMZ0JlqjHiz7DXpKrWsfNkoVZ9A98osMH2nIDS58JVEDc\r\n' +
            'AXoFSLsbdmqFmIc2Ew828TjlX+FLU9tlx89WhSMTapzUjHU=\r\n' +
            '=wxuK\r\n' +
            '-----END PGP PRIVATE KEY BLOCK-----';

        $scope.passphrase = 'passphrase';

        $scope.confirmPassphrase = function() {
            if (!$scope.passphrase) {
                $scope.incorrect = true;
                return;
            }

            $scope.incorrect = false;
            unlockCrypto();
        };

        function unlockCrypto() {
            var userId = emailDao._account.emailAddress;
            emailDao._keychain.getUserKeyPair(userId, function(err, keypair) {
                if (err) {
                    $scope.onError(err);
                    return;
                }

                keypair.privateKey = {
                    _id: keypair.publicKey._id,
                    userId: userId,
                    encryptedKey: $scope.key.privateKeyArmored
                };

                emailDao.unlock({
                    keypair: keypair,
                    passphrase: $scope.passphrase
                }, function(err) {
                    if (err) {
                        $scope.incorrect = true;
                        $scope.onError(err);
                        return;
                    }

                    emailDao._keychain.putUserKeyPair(keypair, onUnlock);
                });
            });
        }

        function onUnlock(err) {
            if (err) {
                $scope.onError(err);
                return;
            }

            $location.path('/desktop');
            $scope.$apply();
        }
    };

    var ngModule = angular.module('login-new-device', []);
    ngModule.directive('fileReader', function() {
        return function(scope, elm) {
            elm.bind('change', function(e) {
                var files = e.target.files,
                    reader = new FileReader();

                if (files.length === 0) {
                    return;
                }

                reader.onload = function(e) {
                    var rawKeys = e.target.result,
                        index = rawKeys.indexOf('-----BEGIN PGP PRIVATE KEY BLOCK-----');

                    if (index === -1) {
                        console.error('Erroneous key file format!');
                        return;
                    }

                    scope.key = {
                        publicKeyArmored: rawKeys.substring(0, index),
                        privateKeyArmored: rawKeys.substring(index, rawKeys.length)
                    };
                    scope.$apply();
                };
                reader.readAsText(files[0]);
            });
        };
    });

    return LoginExistingCtrl;
});