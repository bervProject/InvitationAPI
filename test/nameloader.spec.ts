import loader from '../src/helper/name-loader';
import app from "../src/app";
import Name from "../src/models/name";

describe("Test the name path", () => {
    test("Should load correctly", async () => {
        await loader();

        const successLoad = await Name.findOne({username: 'berviantoleo'});
        expect(successLoad?._id).not.toBeNull();
        expect(successLoad?.name).toBe('Bervianto Leo Pratama');
    });

    afterEach(async () => {
        await Name.deleteMany({});
    })
});