'use strict';
moduleList.push('version');
angular.module('version', [
  'myApp.version.interpolate-filter',
  'myApp.version.version-directive'
])

.value('version', '0.1');
