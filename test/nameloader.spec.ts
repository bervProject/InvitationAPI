import mongoose from 'mongoose';
import loader from '../src/helper/name-loader';
import Name from "../src/models/name";

describe("Test the name path", () => {
    beforeEach(async () => {
        await mongoose.connect(process.env.MONGO_CONNECTION_STRING || '');
    })

    test("Should load correctly", async () => {
        await loader();

        const successLoad = await Name.findOne({username: 'berviantoleo'});
        expect(successLoad?._id).not.toBeNull();
        expect(successLoad?.name).toBe('Bervianto Leo Pratama');
    });

    afterEach(async () => {
        await Name.deleteMany({
            username: 'berviantoleo'
        });
        await mongoose.disconnect();
    })
});