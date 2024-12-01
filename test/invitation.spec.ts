import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import Invitation from "../src/models/invitation";
import Name from "../src/models/name";

describe("Test the invitation path", () => {
    let createdName: any;
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_CONNECTION_STRING || '');
    });

    beforeEach(async() => {
        createdName = await Name.findOneAndUpdate({
            username: 'invitationleo'
        }, {
            username: 'invitationleo',
            name: 'Bervianto',
            createdAt: new Date()
        }, {
            upsert: true,
            returnNewDocument: true,
            new: true
        });
    })

    afterAll(async () => {
        await Name.deleteMany({
            username: 'invitationleo'
        });
        await mongoose.disconnect();
    });

    afterEach(async () => {
        await Invitation.deleteMany({});
    })

    test("It should response the GET method", async () => {
        let dateNow = Date.now();
        let objectItem = {
            invitee: createdName._id,
            inviter: createdName._id,
            message: 'Hello!',
            createdAt: dateNow
        };
        await Invitation.create(objectItem);
        const response = await request(app).get("/invitation/invitationleo");
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1)
        let responseItem = response.body[0];
        expect(responseItem.invitee.username).toBe(createdName.username);
        expect(responseItem.inviter.username).toBe(createdName.username);
        expect(responseItem.message).toBe(objectItem.message);
    });

    test("It should response the POST method", async () => {
        let objectItem = {
            invitee: 'invitationleo',
            inviter: 'invitationleo',
            message: 'Hello!'
        };
        const response = await request(app).post("/invitation").send(objectItem);
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeTruthy();
        let responseItem = response.body;
        expect(responseItem.invitee).toBe(createdName._id.toString());
        expect(responseItem.inviter).toBe(createdName._id.toString());
        expect(responseItem.message).toBe(objectItem.message);
        expect(responseItem.createdAt).toBeTruthy();
        expect(responseItem._id).toBeTruthy();
        expect(responseItem.__v).toBe(0);

        const dataDb = await Invitation.findById(responseItem._id);

        expect(dataDb).toBeTruthy();
        expect(dataDb?.invitee?.toString()).toBe(createdName._id.toString());
        expect(dataDb?.inviter?.toString()).toBe(createdName._id.toString());
        expect(dataDb?.message).toBe(objectItem.message);
        expect(dataDb?._id?.toString()).toBe(responseItem._id);
        expect(dataDb?.__v).toBe(0);
    });
});