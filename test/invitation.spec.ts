import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import Invitation from "../src/models/invitation";

describe("Test the invitation path", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_CONNECTION_STRING || '');
    });

    beforeEach(async () => {
        await Invitation.deleteMany();
    })

    afterAll(async () => {
        await mongoose.disconnect();
    });

    test("It should response the GET method", async () => {
        let dateNow = Date.now();
        let objectItem = {
            invitee: 'every where',
            inviter: 'berviantoleo',
            message: 'Hello!',
            createdAt: dateNow
        };
        await Invitation.create(objectItem);
        const response = await request(app).get("/invitation/berviantoleo");
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1)
        let responseItem = response.body[0];
        expect(responseItem.invitee).toBe(objectItem.invitee);
        expect(responseItem.inviter).toBe(objectItem.inviter);
        expect(responseItem.message).toBe(objectItem.message);
        expect(responseItem.createdAt).toBe(new Date(objectItem.createdAt).toISOString());
    });

    test("It should response the POST method", async () => {
        let objectItem = {
            invitee: 'every where',
            inviter: 'berviantoleo',
            message: 'Hello!'
        };
        const response = await request(app).post("/invitation").send(objectItem);
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeTruthy();
        let responseItem = response.body;
        expect(responseItem.invitee).toBe(objectItem.invitee);
        expect(responseItem.inviter).toBe(objectItem.inviter);
        expect(responseItem.message).toBe(objectItem.message);
        expect(responseItem.createdAt).toBeTruthy();
        expect(responseItem._id).toBeTruthy();
        expect(responseItem.__v).toBe(0);

        const dataDb = await Invitation.findById(responseItem._id);

        expect(dataDb).toBeTruthy();
        expect(dataDb.invitee).toBe(objectItem.invitee);
        expect(dataDb.inviter).toBe(objectItem.inviter);
        expect(dataDb.message).toBe(objectItem.message);
        expect(dataDb.createdAt.toISOString()).toBe(responseItem.createdAt);
        expect(dataDb._id.toString()).toBe(responseItem._id);
        expect(dataDb.__v).toBe(0);
    });
});