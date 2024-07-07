DROP DATABASE IF EXISTS make_me_fit;
CREATE DATABASE make_me_fit;
USE make_me_fit;

CREATE TABLE workout_routines (
  routine_id INT AUTO_INCREMENT PRIMARY KEY,
  routine_name VARCHAR(50),
  data JSON
);

CREATE TABLE diet_plans (
  plan_id INT AUTO_INCREMENT PRIMARY KEY,
  plan_name VARCHAR(50),
  data JSON
);

CREATE TABLE fitness_plans (
  plan_id INT AUTO_INCREMENT PRIMARY KEY,
  plan_name VARCHAR(50),
  active_diet_plan_id INT,
  active_routine_id INT,
  FOREIGN KEY (active_diet_plan_id) REFERENCES diet_plans(plan_id),
  FOREIGN KEY (active_routine_id) REFERENCES workout_routines(routine_id),
  start_date DATE,
  end_date DATE
);

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  dob DATE,
  gender VARCHAR(10),
  weight FLOAT,
  height FLOAT,
  activity_level VARCHAR(20),
  dietary_preference VARCHAR(50),
  calorie_intake FLOAT,
  weight_goal FLOAT,
  activity_goal VARCHAR(20),
  new_user BOOLEAN,
  image JSON,
  active_plan_id INT,
  FOREIGN KEY (active_plan_id) REFERENCES fitness_plans(plan_id)
);

CREATE TABLE user_fitness_plans (
	plan_id INT,
    user_id INT,
	FOREIGN KEY (plan_id) REFERENCES fitness_plans(plan_id),
	FOREIGN KEY (user_id) REFERENCES users(user_id),
    PRIMARY KEY(user_id, plan_id)
);

CREATE TABLE fitness_plan_workout_routines (
	plan_id INT,
    routine_id INT,
	FOREIGN KEY (plan_id) REFERENCES fitness_plans(plan_id),
  FOREIGN KEY (routine_id) REFERENCES workout_routines(routine_id),
 PRIMARY KEY(plan_id, routine_id)
);

CREATE TABLE fitness_plan_diet_plans (
	plan_id INT,
    diet_plan_id INT,
	FOREIGN KEY (plan_id) REFERENCES fitness_plans(plan_id),
  FOREIGN KEY (diet_plan_id) REFERENCES diet_plans(plan_id),
 PRIMARY KEY(plan_id, diet_plan_id)
);

CREATE TABLE tracking_history (
	user_id INT,
	FOREIGN KEY (user_id) REFERENCES users(user_id),
	date DATE,
    weight FLOAT,
    water FLOAT,
    excercise FLOAT,
    food JSON,
	PRIMARY KEY(user_id, date)
);