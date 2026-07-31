import jwt, { JwtPayload } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import config from "../../../config";

export type IJwtPayload = {
	id?: string;
	firstName?: string;
	lastName?: string;
	email: string;
	role: "CUSTOMER" | "ADMIN"  | "STAFF";
	isVerified: boolean;
};

export const createToken = (
	jwtPayload: IJwtPayload,
	secret: string,
	expiresIn: string
) => {
	return jwt.sign(
		jwtPayload,
		secret as jwt.Secret,
		{
			expiresIn: expiresIn as string,
		} as jwt.SignOptions
	);
};

export const verifyToken = (token: string, secret: string): JwtPayload => {
	return jwt.verify(token, secret) as JwtPayload;
};

export const client = new OAuth2Client(config.oauth.google_client_id);
