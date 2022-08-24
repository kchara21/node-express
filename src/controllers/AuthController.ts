import { Request, Response } from "express";
import { User } from "../entity/User";
import { validate } from "class-validator";
import * as jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import config from "../config/config";

export default class AuthController {
  static login = async (req: Request, res: Response) => {
    const { email, clave } = req.body;

    if (!(email && clave)) {
      return res.status(400).json({ message: "User and password required!" });
    }

    const userRepository = AppDataSource.getRepository(User);
    let user: User;

    try {
      user = await userRepository.findOneOrFail({ where: { email } });
    } catch (e) {
      return res
        .status(400)
        .json({ message: "User or password are incorrect!" });
    }

    //Check password
    if (!user.checkPassword(clave)) {
      return res
        .status(400)
        .json({ message: "User or password are incorrect!" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: "2h" }
    );

    res.json({
      message: "OK",
      token,
      userId: user.id,
      email: user.email,
      rol: user.rol,
    });
  };

  static changePassword = async (req: Request, res: Response) => {
    const { userId } = res.locals.jwtPayload;
    const { oldPassword, newPassword } = req.body;

    console.log('USERID----->',userId);

    if (!(oldPassword && newPassword)) {
      return res
        .status(400)
        .json({ message: "Actual and new password are required!" });
    }

    const userRepository = AppDataSource.getRepository(User);
    let user: User;

    try {
      user = await userRepository.findOneBy({id:userId});
     
    } catch (e) {
      res.status(400).json({ message: "Something goes wrong..." });
    }
    console.log('USER->',user);

    if (!user.checkPassword(oldPassword)) {
      return res.status(401).json({ message: "Check your old password..." });
    }

    user.clave = newPassword;
    const validationOps = { validationError: { target: false, value: false } };
    const errors = await validate(user, validationOps);

    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    //Hash password
    user.hashPassword();
    userRepository.save(user);
    res.json({ message: "Password Updated!" });
  };
}
