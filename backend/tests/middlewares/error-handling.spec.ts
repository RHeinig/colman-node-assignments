import { Request, Response } from "express";
import { errorHandler } from "../../middlewares/error-handling";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

describe("Error Handler Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: unknown = {};

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis() as unknown as Response["status"],
      send: jest.fn().mockImplementation((result: unknown) => {
        responseObject = result;
      }) as unknown as Response["send"],
    };
  });

  it("should handle Error instance with 400 status", () => {
    const error = new Error("Test error message");
    errorHandler(error, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith("Test error message");
  });

  it("should handle unknown error with 500 status", () => {
    const error = "string error";
    errorHandler(error, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith("Server Error");
  });
}); 