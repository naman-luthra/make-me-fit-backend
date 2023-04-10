import { Configuration, OpenAIApi } from 'openai';
import jwt from 'jsonwebtoken';
import { getConnectionToDB } from '../db';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const createMealPlan = {
    path: '/api/create-meal-plan',
    method: 'post',
    handler: async (req, res)=>{
        try {
            const {
                user_id,
                fitnessPlanId,
                mealPlanId,
                mealPlanName,
                cuisine,
                place,
                breakfast,
                lunch,
                dinner,
                snacks
            } = req.body;
            const { authorization } = req.headers;
            if(!authorization) return res.status(401).json({ message: 'Authorization header not found!' });
            const token = authorization.split(' ')[1];
            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded)=>{
                if(err) return res.status(401).json({ message: 'Unable to verify!' });
                const { user_id: user_id_decoded  } = decoded;
                if( user_id !== user_id_decoded ) return res.status(403).json({ message: 'Not Authorised!' });
                const db = await getConnectionToDB();
                const [ result ] = await db.query(`SELECT dob, gender, weight, height, dietary_preference, weight_goal FROM users WHERE user_id = '${user_id}'`);
                if(result.length === 0) return res.status(404).json({ message: 'User not found!' });
                if(mealPlanId)
                    await db.query(`DELETE FROM diet_plans WHERE id = ${mealPlanId}`);
                const response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: `Write a 7 day mealplan in .csv format but use | instead of , having day_number,meal,food_combo,calories given that the user likes to eat ${cuisine} food, lives in ${place}. The person is a ${new Date().getFullYear() - result[0].dob.getFullYear()} years old ${result[0].gender}, ${result[0].weight}Kg, ${result[0].height}cm and is a ${result[0].dietary_preference}. The person wants to have ${breakfast ? 'breakfast, ' : ''}${lunch ? 'lunch, ' : ''}${snacks ? 'snacks, ' : ''}${dinner ? 'and dinner' : ''}.`,
                    suffix: "",
                    temperature: 0.7,
                    max_tokens: 2512,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0,
                }).then((response) => response.data);
                const mealPlanTable =  response.choices[0].text.split('\n').map((item)=>item.split('|'));
                const mealPlanObj = ['1','2','3','4','5','6','7'].map((day)=>{
                    const dayPlan = {};
                    mealPlanTable.forEach((item)=>{
                        if(item[0]===day){
                            dayPlan[item[1].toLowerCase()] = {
                                name: item[2],
                                calories: item[3],
                            };
                        }
                    });
                    return dayPlan;
                });
                const [ {insertId} ] = await db.query(`INSERT INTO diet_plans (plan_name, data) VALUES ("${mealPlanName}", '${JSON.stringify({dayPlanArr: mealPlanObj})}')`);
                if(fitnessPlanId){
                    await db.query(`INSERT INTO fitness_plan_diet_plans (plan_id, diet_plan_id) VALUES (${fitnessPlanId}, ${insertId})`);
                    if(mealPlanId)
                        await db.query(`DELETE FROM fitness_plan_diet_plans WHERE diet_plan_id = ${mealPlanId}`);
                }
                return res.status(200).json({id: insertId, name: mealPlanName, data: mealPlanObj});
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Something went wrong!' });
        }
    }
}