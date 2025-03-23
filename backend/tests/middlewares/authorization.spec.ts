import { Request, Response, NextFunction } from "express";
import jwt, { VerifyErrors, JwtPayload } from "jsonwebtoken";
import { authorize, optionalAuthorize } from "../../middlewares/authorization";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

jest.mock("jsonwebtoken");

describe("Authorization Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis() as unknown as Response["status"],
      send: jest.fn() as unknown as Response["send"],
    };
    nextFunction = jest.fn();
    process.env.ACCESS_TOKEN_SECRET = "test-secret";
  });

  describe("authorize middleware", () => {
    it("should return 401 when no token is provided", () => {
      authorize(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith("Unauthorized");
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 403 when token is invalid", () => {
      mockRequest.headers = { authorization: "Bearer invalid-token" };
      const mockError = new Error("Invalid token") as VerifyErrors;
      (jwt.verify as jest.Mock).mockImplementation((...args: unknown[]) => {
        const callback = args[2] as (error: VerifyErrors | null, decoded: JwtPayload | undefined) => void;
        callback(mockError, undefined);
      });

      authorize(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.send).toHaveBeenCalledWith("Invalid token");
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should call next() when token is valid", () => {
      const mockUser = { id: "test-id" };
      mockRequest.headers = { authorization: "Bearer valid-token" };
      (jwt.verify as jest.Mock).mockImplementation((...args: unknown[]) => {
        const callback = args[2] as (error: VerifyErrors | null, decoded: JwtPayload | undefined) => void;
        callback(null, mockUser);
      });

      authorize(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.send).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toEqual(mockUser);
    });
  });

  describe("optionalAuthorize middleware", () => {
    it("should call next() when no token is provided", () => {
      optionalAuthorize(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.send).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalled();
    });

    it("should call next() when token is invalid", () => {
      mockRequest.headers = { authorization: "Bearer invalid-token" };
      const mockError = new Error("Invalid token") as VerifyErrors;
      (jwt.verify as jest.Mock).mockImplementation((...args: unknown[]) => {
        const callback = args[2] as (error: VerifyErrors | null, decoded: JwtPayload | undefined) => void;
        callback(mockError, undefined);
      });

      optionalAuthorize(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.send).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalled();
    });

    it("should set user and call next() when token is valid", () => {
      const mockUser = { id: "test-id" };
      mockRequest.headers = { authorization: "Bearer valid-token" };
      (jwt.verify as jest.Mock).mockImplementation((...args: unknown[]) => {
        const callback = args[2] as (error: VerifyErrors | null, decoded: JwtPayload | undefined) => void;
        callback(null, mockUser);
      });

      optionalAuthorize(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.send).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toEqual(mockUser);
    });
  });
}); 