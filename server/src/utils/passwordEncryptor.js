import bcrypt from "bcrypt";

export const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    console.log("Getting Error while hashing the password ", error);
  }
};

export const comparePassword = async (planeTextPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(planeTextPassword, hashedPassword);
  } catch (error) {
    console.log("Getting Error while comparing the password ", error);
  }
};
