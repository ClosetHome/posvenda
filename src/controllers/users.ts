import User from '../modules/userModule.js'
import {Request, Response} from 'express';
import auth from '../auth'

async function getUsers(req: Request, res: Response, next: any) : Promise<void | any>  {
  try {
      const users = await User.findAll();
      const sanitizedUsers = users.map(user => {
          user.password = '';
          return user.toJSON();
      });
      res.json(sanitizedUsers);
  } catch (error) {
      console.error("Error retrieving users", error);
      res.status(500).json({ message: "Error retrieving users" });
  }
}
 
     async function getUser(req: Request, res: Response, next: any): Promise<void | any>  {
      try {
          const id = parseInt(req.params.id);
          if (!id) throw new Error("ID is invalid format");
          const user = await User.findByPk(id);
          if (!user) {
              return res.status(404).json({ message: "User not found" });
          } else {
              user.password = '';
              res.json(user.toJSON());
          }
      } catch (error:any) {
          console.error(error);
          res.status(400).json({ message: error.message });
      }
  } 

  async function addUser(req: Request, res: Response, next: any) : Promise<void | any>  {
      try {
        let newUser = req.body;
        if (typeof newUser.email !== "string") {
          throw new Error("Email is required");
        }
  
        const existingUser = await User.findOne({ where: { email: newUser.email } });
       
        if (existingUser) {
          if (newUser.password) {
            existingUser.password = auth.hashPassword(newUser.password);
          }
         
          Object.assign(existingUser, newUser);
          await existingUser.save();
          res.status(200).json({ message: "User updated successfully", user: existingUser });
        } else {
          if (newUser.password) {
            newUser.password = auth.hashPassword(newUser.password);
          }
          const createdUser = await User.create(newUser);
          res.status(201).json({ message: "User created successfully", user: createdUser });
        }
      } catch (error: any) {
        console.error('Error in addUser:', error);
        res.status(400).json({ error: error.message });
      }
    }
  
    
async function setUser(req: Request, res: Response, next: any) : Promise<void | any>  {
  try {
    const Userid: any = parseInt(req.params.phone);
    if (!Userid) throw new Error("ID is invalid format");
    const UserParams = req.body;
    const updatedUser: any = await User.update(Userid, UserParams);
    updatedUser.password = "";

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(400).end();
  }
}
 
 async function loginUser(req: Request, res: Response, next: any): Promise<void | any> {
     try{
     const loginParams = req.body 
     const user = await User.findOne({where: {email:loginParams.email}})
     if (user !== null) {
            const isValid = auth.comparePassword(loginParams.password, user.password)
            if(isValid){
                 const token = await auth.sign(user.id!);
                 return res.json({id:user.id , auth: true, token});
            }
     return res.status(401).end()
     } 
     }
    catch (error) {
     console.log(error);
     res.status(400).end()
    }
 }


 function logoutUser(req: Request, res: Response, next: any): void | any {
     res.json({auth: false, token: null });
 }
 export default {getUsers, addUser, getUser, setUser, loginUser, logoutUser}