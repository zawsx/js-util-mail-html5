(function() {
	'use strict';

	requirejs.config({
		nodeRequire: window.nodeRequire,
		baseUrl: 'lib',
		paths: {
			js: '../js',
			test: '../../test',
			'node-forge': 'forge',
			cryptoLib: '../js/crypto',
			'setimmediate': 'setImmediate',
			underscore: 'underscore/underscore-min',
			lawnchair: 'lawnchair/lawnchair-git',
			lawnchairSQL: 'lawnchair/lawnchair-adapter-webkit-sqlite-git',
			lawnchairIDB: 'lawnchair/lawnchair-adapter-indexed-db-git',
			angular: 'angular/angular.min',
			angularRoute: 'angular/angular-route.min',
			angularTouch: 'angular/angular-touch.min',
			uuid: 'uuid/uuid',
			openpgp: 'openpgp/openpgp.min',
			iscroll: 'iscroll/iscroll-min'
		},
		shim: {
			angular: {
				exports: 'angular'
			},
			angularRoute: {
				exports: 'angular',
				deps: ['angular']
			},
			angularTouch: {
				exports: 'angular',
				deps: ['angular']
			},
			iscroll: {
				exports: 'IScroll'
			},
			lawnchair: {
				exports: 'Lawnchair'
			},
			lawnchairSQL: {
				deps: ['lawnchair']
			},
			lawnchairIDB: {
				deps: ['lawnchair', 'lawnchairSQL']
			},
			underscore: {
				exports: '_'
			}
		}
	});

}());