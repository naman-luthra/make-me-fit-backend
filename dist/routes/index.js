"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Routes = void 0;
var _createFitnessPlan = require("./create-fitness-plan");
var _createMealPlan = require("./create-meal-plan");
var _createWorkoutRoutine = require("./create-workout-routine");
var _getPlanData = require("./get-plan-data");
var _getUserData = require("./get-user-data");
var _getUserHistory = require("./get-user-history");
var _saveUserProgress = require("./save-user-progress");
var _signin = require("./signin");
var _signup = require("./signup");
var _submitUserInfo = require("./submit-user-info");
var _test = require("./test");
var _updateUserMetrics = require("./update-user-metrics");
var _uploadUserImage = require("./upload-user-image");
var Routes = [_signin.signIn, _signup.signUp, _test.test, _submitUserInfo.submitUserInfo, _getUserData.getUserData, _createMealPlan.createMealPlan, _createWorkoutRoutine.createWorkoutRoutine, _createFitnessPlan.createFitnessPlan, _uploadUserImage.uploadUserImage, _updateUserMetrics.updateUsermetrics, _getPlanData.getPlanData, _saveUserProgress.saveUserProgress, _getUserHistory.getUserHistory];
exports.Routes = Routes;