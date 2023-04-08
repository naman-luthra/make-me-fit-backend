import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getConnectionToDB } from '../db';

export const signUp = {
    path: '/api/signup',
    method: 'post',
    handler: async (req, res)=>{
        try {
            const { firstName, lastName , email, password } = req.body;
            const db = await getConnectionToDB();
            const [ rows ] = await db.query(`SELECT email FROM users WHERE email = '${email}'`);
            if (rows.length > 0) {
                return res.sendStatus(409);
            }
            const passwordHash = await bcrypt.hash(password, 10);
            const [ {insertId} ] = await db.query(`INSERT INTO users (first_name, last_name, email, password, new_user) VALUES ('${firstName}', '${lastName}', '${email}', '${passwordHash}', TRUE)`);
            const user_id = insertId;
            jwt.sign({
                user_id,
                email,
                firstName,
                lastName,
                newUser: true,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d',
            },
            (err, token)=>{
                if (err) {
                    return res.status(500).send(err);
                }
                res.status(200).json({ token });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Something went wrong!' });
        }
    }
}