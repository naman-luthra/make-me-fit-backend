import { createFitnessPlan } from "./create-fitness-plan";
import { createMealPlan } from "./create-meal-plan";
import { createWorkoutRoutine } from "./create-workout-routine";
import { getUserData } from "./get-user-data";
import { signIn } from "./signin";
import { signUp } from "./signup";
import { submitUserInfo } from "./submit-user-info";
import { test } from "./test";

export const Routes=[
    signIn,
    signUp,
    test,
    submitUserInfo,
    getUserData,
    createMealPlan,
    createWorkoutRoutine,
    createFitnessPlan
];