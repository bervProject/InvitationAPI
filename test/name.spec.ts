import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import Name from "../src/models/name";

describe("Test the name path", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_CONNECTION_STRING || '');
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    test("It should response the GET method", async () => {
        let dateNow = Date.now();
        const objectItem = {
            username: 'berviantoleo',
            name: 'Bervianto',
            createdAt: dateNow
        };
        await Name.create(objectItem);
        const response = await request(app).get("/name/berviantoleo");
        expect(response.statusCode).toBe(200);
        expect(response.body.username).toBe(objectItem.username);
        expect(response.body.name).toBe(objectItem.name);
        expect(response.body.createdAt).toBe(new Date(objectItem.createdAt).toISOString());
    });
});