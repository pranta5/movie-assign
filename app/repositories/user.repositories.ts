import { UserInterface } from "../types/user.types";
import { UserModel } from "../models/user.model";

class UserRepoV2 {
  // Fetch a user's profile (excluding password)
  async getProfile(userId: string): Promise<UserInterface | null> {
    try {
      return await UserModel.findById(userId).select("-password");
    } catch (err: any) {
      throw new Error(`Failed to retrieve user profile: ${err.message}`);
    }
  }
}

const userRepositories = new UserRepoV2();

export { userRepositories };
